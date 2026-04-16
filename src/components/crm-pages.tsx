"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightCircle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FilePlus2,
  LifeBuoy,
  Plus,
  Search,
  ShieldAlert,
  UserCheck,
  Wallet,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@/components/auth-provider";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@/components/ui";
import { authService } from "@/lib/auth";
import { formatCurrency, formatDate, formatMonth, roleLabel, statusLabel } from "@/lib/format";
import {
  customerService,
  dashboardService,
  getDemoUsers,
  invoiceService,
  notificationService,
  paymentService,
  subscriptionService,
  ticketService,
} from "@/lib/services";
import type {
  Customer,
  DashboardMetric,
  Notification,
  Subscription,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function PageIntro({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
          Frontend Demo
        </p>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">{description}</p>
        </div>
      </div>
      {actions}
    </div>
  );
}

function MetricCard({ metric }: { metric: DashboardMetric }) {
  const toneClass = {
    default: "text-slate-700 bg-slate-100",
    success: "text-emerald-700 bg-emerald-100",
    warning: "text-amber-800 bg-amber-100",
    danger: "text-rose-700 bg-rose-100",
  }[metric.tone];

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className={cn("w-fit rounded-full px-3 py-1 text-xs font-semibold", toneClass)}>
          {metric.label}
        </div>
        <CardTitle className="pt-3 text-3xl">{metric.value}</CardTitle>
        <CardDescription>{metric.delta}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function toneForStatus(status: string) {
  if (["active", "paid", "resolved"].includes(status)) return "success";
  if (["grace_period", "unpaid", "assigned"].includes(status)) return "warning";
  if (["suspended", "overdue", "open"].includes(status)) return "danger";
  return "info";
}

function StatusBadge({ status }: { status: string }) {
  return <Badge tone={toneForStatus(status)}>{statusLabel(status as never)}</Badge>;
}

function EmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
          <Icon className="size-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="max-w-md text-sm text-[var(--muted-foreground)]">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <Card>
      <CardContent className="py-16 text-center text-sm text-[var(--muted-foreground)]">
        Memuat data demo...
      </CardContent>
    </Card>
  );
}

function WorkflowCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-[var(--muted)]/60 p-5">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
        <Icon className="size-4" />
      </div>
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
    </div>
  );
}

function Field({
  label,
  formError,
  children,
}: {
  label: string;
  formError?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 px-4 py-3">
      <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
      <span className="text-right text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}

export function LoginPage() {
  const demoUsers = React.useMemo(() => getDemoUsers(), []);
  const schema = z.object({
    email: z.email("Email tidak valid."),
    password: z.string().min(3, "Password wajib diisi."),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "admin@crmisp.local",
      password: "admin123",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await authService.login(values.email, values.password);
      toast.success("Login berhasil. Redirect ke dashboard...");
      window.location.assign("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login gagal.");
    }
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,#f8fafc_40%,#f5efe6_100%)] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.04)_0%,transparent_40%,rgba(59,130,246,0.08)_100%)]" />
      <div className="relative grid w-full max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-white/70 bg-white/80">
          <CardHeader className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
                <ShieldAlert className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                  CRM ISP
                </p>
                <CardTitle className="text-3xl">Centralized operator frontend</CardTitle>
              </div>
            </div>
            <CardDescription className="max-w-2xl text-base leading-7">
              Frontend-only demo untuk mengelola customer, subscription, billing, dan ticketing.
              Semua alur memakai mocked data yang persisten di browser agar siap dipakai untuk demo
              produk atau integrasi backend berikutnya.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {demoUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                className="rounded-[24px] border border-[var(--border)] bg-[var(--muted)]/60 p-5 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                onClick={() => {
                  form.setValue("email", user.email);
                  form.setValue("password", user.passwordHash);
                }}
              >
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                  {roleLabel(user.role)}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{user.name}</h3>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{user.email}</p>
                <p className="mt-3 text-sm text-slate-600">
                  Klik untuk autofill akun demo {roleLabel(user.role).toLowerCase()}.
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/88">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Gunakan akun demo di kiri atau login manual untuk membuka role-specific dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" {...form.register("email")} />
                {form.formState.errors.email ? (
                  <p className="text-sm text-rose-600">{form.formState.errors.email.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register("password")} />
                {form.formState.errors.password ? (
                  <p className="text-sm text-rose-600">{form.formState.errors.password.message}</p>
                ) : null}
              </div>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Signing in..." : "Masuk ke dashboard"}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="rounded-[24px] bg-slate-950 p-5 text-slate-100">
              <p className="text-sm font-semibold">Demo note</p>
              <p className="mt-2 text-sm text-slate-300">
                Session disimpan lewat cookie mock, sedangkan data CRM tersimpan di localStorage.
                Jadi semua perubahan invoice, payment, atau ticket tetap ada selama browser ini
                tidak di-reset.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = React.useState<DashboardMetric[] | null>(null);
  const [activity, setActivity] = React.useState<Notification[]>([]);

  React.useEffect(() => {
    if (!user) return;
    void Promise.all([dashboardService.metricsFor(user), dashboardService.recentActivity(user)]).then(
      ([metricData, activityData]) => {
        setMetrics(metricData);
        setActivity(activityData);
      },
    );
  }, [user]);

  if (!user || !metrics) {
    return <LoadingState />;
  }

  return (
    <div>
      <PageIntro
        title={`Halo, ${user.name}`}
        description="Ringkasan operasional hari ini disesuaikan dengan role aktif Anda. Semua angka di bawah memakai mocked business rules dari PRD."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Role-focused workflow</CardTitle>
            <CardDescription>
              Dashboard ini mengarahkan tiap role ke tugas utama agar navigasi terasa seperti
              produk CRM yang siap dipakai tim internal dan customer portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {user.role === "admin" ? (
              <>
                <WorkflowCard
                  icon={UserCheck}
                  title="Customer management"
                  description="Tambah, ubah, dan pantau status pelanggan dalam satu layar."
                />
                <WorkflowCard
                  icon={ArrowRightCircle}
                  title="Subscription lifecycle"
                  description="Lihat state active, grace period, hingga suspended dengan hint bisnis."
                />
              </>
            ) : null}
            {user.role === "finance" ? (
              <>
                <WorkflowCard
                  icon={FilePlus2}
                  title="Invoice generation"
                  description="Buat invoice bulanan dan cegah duplikasi periode otomatis."
                />
                <WorkflowCard
                  icon={Wallet}
                  title="Payment recording"
                  description="Catat pembayaran simulasi dan ubah invoice menjadi paid."
                />
              </>
            ) : null}
            {user.role === "technician" ? (
              <>
                <WorkflowCard
                  icon={LifeBuoy}
                  title="Ticket handling"
                  description="Assign ticket ke diri sendiri lalu resolve setelah penanganan selesai."
                />
                <WorkflowCard
                  icon={CheckCircle2}
                  title="SLA readiness"
                  description="Fokus ke ticket assigned dan pastikan tidak ada queue yang idle."
                />
              </>
            ) : null}
            {user.role === "customer" ? (
              <>
                <WorkflowCard
                  icon={CreditCard}
                  title="Billing saya"
                  description="Pantau invoice aktif, riwayat pembayaran, dan status langganan."
                />
                <WorkflowCard
                  icon={BellRing}
                  title="Support cepat"
                  description="Laporkan issue dan ikuti progres ticket dari portal pelanggan."
                />
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Simulated notification stream dari state billing dan ticketing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={item.type === "billing" ? "warning" : item.type === "ticket" ? "info" : "neutral"}>
                    {item.type}
                  </Badge>
                  <span className="text-xs text-[var(--muted-foreground)]">{formatDate(item.createdAt)}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Customer | null>(null);

  const schema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter."),
    email: z.email("Email tidak valid."),
    address: z.string().min(6, "Alamat terlalu pendek."),
    status: z.enum(["active", "suspended"]),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", address: "", status: "active" },
  });

  const loadCustomers = React.useCallback(async () => {
    const data = await customerService.list();
    setCustomers(data);
    setSelectedId((current) => current ?? data[0]?.id ?? null);
  }, []);

  React.useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const filtered = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      customer.email.toLowerCase().includes(query.toLowerCase()),
  );
  const selectedCustomer = filtered.find((customer) => customer.id === selectedId) ?? customers[0];

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editing) {
        await customerService.update(editing.id, values);
        toast.success("Customer berhasil diperbarui.");
      } else {
        await customerService.create(values);
        toast.success("Customer baru berhasil dibuat.");
      }
      form.reset({ name: "", email: "", address: "", status: "active" });
      setOpen(false);
      setEditing(null);
      await loadCustomers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan customer.");
    }
  });

  const openEditor = (customer?: Customer) => {
    setEditing(customer ?? null);
    form.reset(customer ?? { name: "", email: "", address: "", status: "active" });
    setOpen(true);
  };

  return (
    <div>
      <PageIntro
        title="Customer management"
        description="Kelola data pelanggan ISP secara terpusat. Pencarian, detail, dan edit form sudah siap untuk dihubungkan ke backend nanti."
        actions={
          <Button onClick={() => openEditor()}>
            <Plus className="mr-2 size-4" />
            Tambah customer
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Daftar customers</CardTitle>
                <CardDescription>Search, filter, dan quick scan status pelanggan.</CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-[var(--muted-foreground)]" />
                <Input
                  className="pl-9"
                  placeholder="Cari nama / email"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <button type="button" className="space-y-1 text-left" onClick={() => setSelectedId(customer.id)}>
                          <p className="font-semibold text-slate-900">{customer.name}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{customer.email}</p>
                        </button>
                      </TableCell>
                      <TableCell><StatusBadge status={customer.status} /></TableCell>
                      <TableCell>{formatDate(customer.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openEditor(customer)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="Customer tidak ditemukan"
                description="Coba ubah kata kunci pencarian atau tambahkan customer baru."
                icon={Search}
              />
            )}
          </CardContent>
        </Card>

        {selectedCustomer ? (
          <Card>
            <CardHeader>
              <CardTitle>Customer detail</CardTitle>
              <CardDescription>Panel ringkas untuk review data tanpa pindah halaman.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Nama</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">{selectedCustomer.name}</h3>
              </div>
              <InfoRow label="Email" value={selectedCustomer.email} />
              <InfoRow label="Alamat" value={selectedCustomer.address} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Status</span>
                <StatusBadge status={selectedCustomer.status} />
              </div>
              <InfoRow label="Joined" value={formatDate(selectedCustomer.createdAt)} />
            </CardContent>
          </Card>
        ) : (
          <LoadingState />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit customer" : "Tambah customer"}</DialogTitle>
            <DialogDescription>Form tervalidasi dengan react-hook-form dan zod.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field formError={form.formState.errors.name?.message} label="Nama">
              <Input {...form.register("name")} />
            </Field>
            <Field formError={form.formState.errors.email?.message} label="Email">
              <Input {...form.register("email")} />
            </Field>
            <Field formError={form.formState.errors.address?.message} label="Alamat">
              <Textarea {...form.register("address")} />
            </Field>
            <Field formError={form.formState.errors.status?.message} label="Status">
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan customer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function SubscriptionsPage() {
  const [items, setItems] = React.useState<Array<Subscription & { customerName: string; hint: string }>>([]);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);

  const schema = z.object({
    customerId: z.string().min(1, "Customer wajib dipilih."),
    plan: z.string().min(3, "Plan wajib diisi."),
    price: z.coerce.number().min(100000, "Harga minimal Rp100.000."),
    startDate: z.string().min(1, "Start date wajib diisi."),
    endDate: z.string().min(1, "End date wajib diisi."),
  });
  const form = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { customerId: "", plan: "", price: 325000, startDate: "", endDate: "" },
  });

  const load = React.useCallback(async () => {
    const [subscriptionData, customerData] = await Promise.all([
      subscriptionService.list(),
      customerService.list(),
    ]);
    setItems(subscriptionData);
    setCustomers(customerData);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = statusFilter === "all" ? items : items.filter((item) => item.status === statusFilter);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await subscriptionService.create(values);
      toast.success("Subscription berhasil dibuat.");
      form.reset({ customerId: "", plan: "", price: 325000, startDate: "", endDate: "" });
      setOpen(false);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat subscription.");
    }
  });

  const updateStatus = async (id: string, status: Subscription["status"]) => {
    await subscriptionService.updateStatus(id, status);
    toast.success("Status subscription diperbarui.");
    await load();
  };

  return (
    <div>
      <PageIntro
        title="Subscription lifecycle"
        description="Pantau paket internet pelanggan, harga, dan transisi active → grace period → suspended dengan hint bisnis yang mudah dibaca."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 size-4" />
            Tambah subscription
          </Button>
        }
      />

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="grace_period">Grace period</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
        </TabsList>
        <TabsContent value={statusFilter}>
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((subscription) => (
              <Card key={subscription.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{subscription.plan}</CardTitle>
                      <CardDescription>{subscription.customerName}</CardDescription>
                    </div>
                    <StatusBadge status={subscription.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoRow label="Harga" value={formatCurrency(subscription.price)} />
                    <InfoRow label="Periode" value={`${subscription.startDate} s/d ${subscription.endDate}`} />
                  </div>
                  <div className="rounded-[24px] bg-[var(--muted)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
                    {subscription.hint}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                      State timeline
                    </p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {["active", "grace_period", "suspended"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          className={cn(
                            "rounded-2xl border px-3 py-3 text-sm font-medium",
                            subscription.status === status
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-[var(--border)] bg-white text-slate-600",
                          )}
                          onClick={() => void updateStatus(subscription.id, status as Subscription["status"])}
                        >
                          {statusLabel(status as never)}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah subscription</DialogTitle>
            <DialogDescription>
              Mocked form ini sudah punya kontrak data yang siap dihubungkan ke endpoint backend.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field label="Customer" formError={form.formState.errors.customerId?.message}>
              <Controller
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Pilih customer" /></SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Plan" formError={form.formState.errors.plan?.message}>
              <Input placeholder="Fiber Home 200 Mbps" {...form.register("plan")} />
            </Field>
            <Field label="Harga" formError={form.formState.errors.price?.message}>
              <Input type="number" {...form.register("price")} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Start date" formError={form.formState.errors.startDate?.message}>
                <Input type="date" {...form.register("startDate")} />
              </Field>
              <Field label="End date" formError={form.formState.errors.endDate?.message}>
                <Input type="date" {...form.register("endDate")} />
              </Field>
            </div>
            <Button type="submit" className="w-full">Simpan subscription</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function normalizeInvoice(invoice: Awaited<ReturnType<typeof invoiceService.list>>[number]) {
  return invoice;
}

export function InvoicesPage() {
  const [invoices, setInvoices] = React.useState<Array<Awaited<ReturnType<typeof invoiceService.list>>[number]>>([]);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);

  const schema = z.object({
    customerId: z.string().min(1, "Customer wajib dipilih."),
    month: z.string().regex(/^\d{4}-\d{2}$/, "Format bulan harus YYYY-MM."),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { customerId: "", month: "2026-04" },
  });

  const load = React.useCallback(async () => {
    const [invoiceData, customerData] = await Promise.all([
      invoiceService.list(),
      customerService.list(),
    ]);
    setInvoices(invoiceData.map(normalizeInvoice));
    setCustomers(customerData);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = statusFilter === "all" ? invoices : invoices.filter((invoice) => invoice.status === statusFilter);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await invoiceService.generate(values);
      toast.success("Invoice berhasil dibuat.");
      setOpen(false);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal generate invoice.");
    }
  });

  return (
    <div>
      <PageIntro
        title="Billing & invoice generator"
        description="Finance bisa generate invoice per customer per bulan, memantau unpaid/overdue, dan melihat due-date risk secara visual."
        actions={
          <Button onClick={() => setOpen(true)}>
            <FilePlus2 className="mr-2 size-4" />
            Generate invoice
          </Button>
        }
      />

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
        <TabsContent value={statusFilter}>
          <Card>
            <CardHeader>
              <CardTitle>Invoice register</CardTitle>
              <CardDescription>Duplicate invoice dicegah lewat validasi periode + customer.</CardDescription>
            </CardHeader>
            <CardContent>
              {filtered.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Periode</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium text-slate-900">{invoice.customerName}</TableCell>
                        <TableCell>{formatMonth(invoice.monthKey)}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell><StatusBadge status={invoice.status} /></TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p>{formatDate(invoice.dueDate)}</p>
                            {invoice.status === "overdue" ? (
                              <p className="text-xs text-rose-600">Needs reminder & escalation</p>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  title="Belum ada invoice di filter ini"
                  description="Coba ubah tab status atau buat invoice baru."
                  icon={CalendarClock}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate invoice</DialogTitle>
            <DialogDescription>
              Satu customer hanya bisa punya satu invoice untuk satu periode bulan.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field label="Customer" formError={form.formState.errors.customerId?.message}>
              <Controller
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Pilih customer" /></SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Periode bulan" formError={form.formState.errors.month?.message}>
              <Input placeholder="2026-04" {...form.register("month")} />
            </Field>
            <Button type="submit" className="w-full">Generate invoice</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PaymentsPage() {
  const [payments, setPayments] = React.useState<Array<Awaited<ReturnType<typeof paymentService.list>>[number]>>([]);
  const [invoiceOptions, setInvoiceOptions] = React.useState<Array<Awaited<ReturnType<typeof invoiceService.list>>[number]>>([]);
  const [open, setOpen] = React.useState(false);

  const schema = z.object({
    invoiceId: z.string().min(1, "Invoice wajib dipilih."),
    amount: z.coerce.number().min(1, "Amount harus lebih dari 0."),
    method: z.string().min(2, "Metode pembayaran wajib diisi."),
  });
  const form = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { invoiceId: "", amount: 0, method: "transfer" },
  });

  const load = React.useCallback(async () => {
    const [paymentData, invoiceData] = await Promise.all([
      paymentService.list(),
      invoiceService.list(),
    ]);
    setPayments(paymentData);
    setInvoiceOptions(invoiceData.filter((invoice) => invoice.status !== "paid"));
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await paymentService.create(values);
      toast.success("Pembayaran berhasil dicatat.");
      setOpen(false);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mencatat pembayaran.");
    }
  });

  return (
    <div>
      <PageIntro
        title="Payment tracking"
        description="Catat pembayaran simulasi tanpa payment gateway. Invoice akan otomatis berubah menjadi paid saat transaksi dibuat."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Wallet className="mr-2 size-4" />
            Record payment
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pending collection</CardTitle>
            <CardDescription>Unpaid dan overdue invoice yang masih bisa diproses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invoiceOptions.length ? (
              invoiceOptions.map((invoice) => (
                <div key={invoice.id} className="rounded-[24px] border border-[var(--border)] bg-[var(--muted)]/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{invoice.customerName}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">{formatMonth(invoice.monthKey)}</p>
                    </div>
                    <StatusBadge status={invoice.status} />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-slate-950">{formatCurrency(invoice.amount)}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Due {formatDate(invoice.dueDate)}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="Semua invoice sudah paid"
                description="Tidak ada invoice yang perlu dicatat pembayaran lagi."
                icon={CheckCircle2}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment log</CardTitle>
            <CardDescription>Riwayat pembayaran yang sudah berhasil dibukukan.</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid at</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.customerName}</TableCell>
                      <TableCell className="capitalize">{payment.method}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{formatDate(payment.paidAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="Belum ada payment"
                description="Record payment pertama untuk melihat perubahan status invoice."
                icon={Wallet}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>Pilih invoice yang belum paid, lalu catat metode pembayarannya.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field label="Invoice" formError={form.formState.errors.invoiceId?.message}>
              <Controller
                control={form.control}
                name="invoiceId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      const invoice = invoiceOptions.find((entry) => entry.id === value);
                      form.setValue("amount", invoice?.amount ?? 0);
                      field.onChange(value);
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Pilih invoice" /></SelectTrigger>
                    <SelectContent>
                      {invoiceOptions.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.customerName} - {formatCurrency(invoice.amount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Amount" formError={form.formState.errors.amount?.message}>
              <Input type="number" {...form.register("amount")} />
            </Field>
            <Field label="Method" formError={form.formState.errors.method?.message}>
              <Controller
                control={form.control}
                name="method"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="virtual_account">Virtual Account</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Button type="submit" className="w-full">Simpan payment</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = React.useState<Array<Awaited<ReturnType<typeof ticketService.list>>[number]>>([]);

  const load = React.useCallback(async () => {
    const data = await ticketService.list();
    setTickets(data);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const assignToMe = async (id: string) => {
    if (!user) return;
    try {
      await ticketService.update(id, { assignedTo: user.id });
      toast.success("Ticket berhasil di-assign ke Anda.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal assign ticket.");
    }
  };

  const resolveTicket = async (id: string) => {
    try {
      await ticketService.update(id, { status: "resolved" });
      toast.success("Ticket ditandai resolved.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal resolve ticket.");
    }
  };

  return (
    <div>
      <PageIntro
        title="Trouble ticketing"
        description="Teknisi menangani ticket terbuka, assign ke diri sendiri, lalu resolve setelah issue selesai. Rule “assigned before resolved” dipaksa di UI dan service layer."
      />

      <Card>
        <CardHeader>
          <CardTitle>Ticket queue</CardTitle>
          <CardDescription>Open, assigned, dan resolved flow sesuai state machine di PRD.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.customerName}</TableCell>
                  <TableCell className="max-w-sm text-[var(--muted-foreground)]">{ticket.issue}</TableCell>
                  <TableCell><StatusBadge status={ticket.status} /></TableCell>
                  <TableCell>{ticket.assignedToName}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {ticket.status === "open" ? (
                        <Button size="sm" variant="outline" onClick={() => void assignToMe(ticket.id)}>
                          Assign to me
                        </Button>
                      ) : null}
                      {ticket.status === "assigned" ? (
                        <Button size="sm" onClick={() => void resolveTicket(ticket.id)}>
                          Resolve
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  React.useEffect(() => {
    if (!user) return;
    void notificationService.list(user.role === "admin" ? undefined : user.id).then(setNotifications);
  }, [user]);

  return (
    <div>
      <PageIntro
        title="Notification center"
        description="Semua reminder dan escalation di-simulasikan di frontend ini, tapi struktur datanya sudah siap untuk notifikasi real-time nanti."
      />

      <div className="grid gap-4">
        {notifications.map((notification) => (
          <Card key={notification.id}>
            <CardContent className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--muted)] text-slate-700">
                  <BellRing className="size-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={notification.type === "billing" ? "warning" : "info"}>
                      {notification.type}
                    </Badge>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{notification.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function CustomerBillingPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = React.useState<Array<Awaited<ReturnType<typeof invoiceService.list>>[number]>>([]);
  const [subscriptionList, setSubscriptionList] = React.useState<Array<Awaited<ReturnType<typeof subscriptionService.list>>[number]>>([]);

  React.useEffect(() => {
    if (!user?.customerId) return;
    void Promise.all([invoiceService.list(), subscriptionService.list()]).then(
      ([invoiceData, subscriptionData]) => {
        setInvoices(invoiceData.filter((invoice) => invoice.customerId === user.customerId));
        setSubscriptionList(
          subscriptionData.filter((subscription) => subscription.customerId === user.customerId),
        );
      },
    );
  }, [user]);

  const payInvoice = async (invoiceId: string, amount: number) => {
    await paymentService.create({ invoiceId, amount, method: "transfer" });
    toast.success("Pembayaran simulasi berhasil.");
    if (!user?.customerId) return;
    const [invoiceData, subscriptionData] = await Promise.all([
      invoiceService.list(),
      subscriptionService.list(),
    ]);
    setInvoices(invoiceData.filter((invoice) => invoice.customerId === user.customerId));
    setSubscriptionList(
      subscriptionData.filter((subscription) => subscription.customerId === user.customerId),
    );
  };

  return (
    <div>
      <PageIntro
        title="Billing saya"
        description="Portal pelanggan untuk melihat plan aktif, tagihan berjalan, dan melakukan pembayaran simulasi."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Subscription aktif</CardTitle>
            <CardDescription>Status paket internet Anda saat ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionList.map((subscription) => (
              <div key={subscription.id} className="rounded-[24px] bg-[var(--muted)]/70 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{subscription.plan}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {formatCurrency(subscription.price)} / bulan
                    </p>
                  </div>
                  <StatusBadge status={subscription.status} />
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{subscription.hint}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice saya</CardTitle>
            <CardDescription>Pembayaran simulasi langsung mengubah status invoice menjadi paid.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="rounded-[24px] border border-[var(--border)] p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{formatMonth(invoice.monthKey)}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">Due {formatDate(invoice.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={invoice.status} />
                    <span className="text-lg font-semibold text-slate-950">
                      {formatCurrency(invoice.amount)}
                    </span>
                  </div>
                </div>
                {invoice.status !== "paid" ? (
                  <Button className="mt-4" onClick={() => void payInvoice(invoice.id, invoice.amount)}>
                    Bayar sekarang
                  </Button>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function CustomerTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = React.useState<Array<Awaited<ReturnType<typeof ticketService.list>>[number]>>([]);

  const schema = z.object({
    issue: z.string().min(10, "Mohon jelaskan issue minimal 10 karakter."),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { issue: "" },
  });

  React.useEffect(() => {
    if (!user?.customerId) return;
    void ticketService.list().then((allTickets) => {
      setTickets(allTickets.filter((ticket) => ticket.customerId === user.customerId));
    });
  }, [user]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!user?.customerId) return;
    await ticketService.create({ customerId: user.customerId, issue: values.issue });
    toast.success("Ticket berhasil dibuat.");
    form.reset({ issue: "" });
    const allTickets = await ticketService.list();
    setTickets(allTickets.filter((ticket) => ticket.customerId === user.customerId));
  });

  return (
    <div>
      <PageIntro
        title="Ticket saya"
        description="Laporkan gangguan atau isu layanan, lalu pantau status open → assigned → resolved dari portal pelanggan."
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Buat ticket baru</CardTitle>
            <CardDescription>Issue akan masuk ke antrian teknisi sebagai status open.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <Field label="Jelaskan issue" formError={form.formState.errors.issue?.message}>
                <Textarea
                  aria-label="Jelaskan issue"
                  placeholder="Contoh: Internet putus sejak pagi, lampu LOS berkedip merah..."
                  {...form.register("issue")}
                />
              </Field>
              <Button type="submit" className="w-full">Submit ticket</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat ticket</CardTitle>
            <CardDescription>Status terbaru bantuan teknis Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tickets.length ? (
              tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-[24px] border border-[var(--border)] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{ticket.issue}</p>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        Dibuat {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                    Assigned: {ticket.assignedToName}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="Belum ada ticket"
                description="Saat ada gangguan koneksi, buat ticket baru dari form di sebelah kiri."
                icon={LifeBuoy}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
