import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Leaf,
  LogOut,
  Package,
  CalendarCheck,
  MessageSquare,
  Star,
  Trash2,
  Download,
  Search,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { exportToCSV } from "@/lib/csv";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminDashboard,
});

const MONTHLY_CONE_GOAL = 100;

type Booking = {
  id: string;
  name: string;
  phone: string;
  email: string;
  event_type: string;
  event_date: string;
  location: string;
  notes: string | null;
  created_at: string;
};

type Order = {
  id: string;
  name: string;
  phone: string;
  email: string;
  product_type: string;
  quantity: number;
  address: string;
  notes: string | null;
  status: "Pending" | "Contacted" | "Completed";
  created_at: string;
};

type Contact = {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  message: string;
  created_at: string;
};

type Review = {
  id: string;
  name: string;
  city: string | null;
  rating: number;
  review: string;
  approved: boolean;
  created_at: string;
};

type Tab = "overview" | "bookings" | "orders" | "contacts" | "reviews";

function AdminDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const bookings = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Booking[];
    },
  });
  const orders = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });
  const contacts = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Contact[];
    },
  });
  const reviews = useQuery({
    queryKey: ["reviews-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Cone tracking (current month, all statuses count as "sold" once created)
  const organicSold = useMemo(
    () =>
      (orders.data ?? [])
        .filter(
          (o) =>
            o.product_type === "Organic Henna Cone" && new Date(o.created_at) >= monthStart,
        )
        .reduce((sum, o) => sum + (o.quantity || 0), 0),
    [orders.data, monthStart],
  );
  const nailSold = useMemo(
    () =>
      (orders.data ?? [])
        .filter((o) => o.product_type === "Nail Cone" && new Date(o.created_at) >= monthStart)
        .reduce((sum, o) => sum + (o.quantity || 0), 0),
    [orders.data, monthStart],
  );
  const totalCones = organicSold + nailSold;
  const conePct = Math.min(100, Math.round((totalCones / MONTHLY_CONE_GOAL) * 100));

  const monthlyOrders = (orders.data ?? []).filter((o) => new Date(o.created_at) >= monthStart)
    .length;
  const monthlyBookings = (bookings.data ?? []).filter(
    (b) => new Date(b.created_at) >= monthStart,
  ).length;

  // Chart data — last 30 days
  const dailyData = useMemo(() => {
    const days: { day: string; orders: number; bookings: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const inRange = (iso: string) => {
        const t = new Date(iso).getTime();
        return t >= d.getTime() && t < next.getTime();
      };
      days.push({
        day: `${d.getMonth() + 1}/${d.getDate()}`,
        orders: (orders.data ?? []).filter((o) => inRange(o.created_at)).length,
        bookings: (bookings.data ?? []).filter((b) => inRange(b.created_at)).length,
      });
    }
    return days;
  }, [orders.data, bookings.data]);

  const coneChart = [
    { name: "Organic", value: organicSold },
    { name: "Nail", value: nailSold },
    { name: "Remaining", value: Math.max(0, MONTHLY_CONE_GOAL - totalCones) },
  ];

  return (
    <div className="min-h-screen bg-cream/40">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-gold text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </span>
            <div>
              <div className="font-serif text-lg leading-tight text-primary">Soulcone</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Admin
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:block">{email}</span>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent/10"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 pb-2 md:px-8">
          {(["overview", "bookings", "orders", "contacts", "reviews"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium capitalize transition ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent/10"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={CalendarCheck}
                label="Total Bookings"
                value={bookings.data?.length ?? 0}
                sub={`${monthlyBookings} this month`}
              />
              <StatCard
                icon={Package}
                label="Total Orders"
                value={orders.data?.length ?? 0}
                sub={`${monthlyOrders} this month`}
              />
              <StatCard
                icon={MessageSquare}
                label="Total Contacts"
                value={contacts.data?.length ?? 0}
              />
              <StatCard
                icon={Star}
                label="Total Reviews"
                value={reviews.data?.length ?? 0}
                sub={`${(reviews.data ?? []).filter((r) => r.approved).length} approved`}
              />
            </div>

            {/* Cone tracking */}
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  <h2 className="font-serif text-xl text-primary">Monthly Cone Goal</h2>
                </div>
                <div className="text-sm text-muted-foreground">
                  {totalCones} / {MONTHLY_CONE_GOAL} cones
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <MiniStat label="Organic Henna Cones" value={organicSold} />
                <MiniStat label="Nail Cones" value={nailSold} />
                <MiniStat label="Progress" value={`${conePct}%`} />
              </div>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-cream">
                <div
                  className="h-full bg-gradient-gold transition-all"
                  style={{ width: `${conePct}%` }}
                />
              </div>
              <div className="mt-6 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coneChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e6dfd3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#b98950" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time series */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Orders — last 30 days">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6dfd3" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#b98950"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartCard>
              <ChartCard title="Bookings — last 30 days">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6dfd3" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#8b5a3c"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartCard>
            </div>
          </div>
        )}

        {tab === "bookings" && (
          <BookingsTable rows={bookings.data ?? []} loading={bookings.isLoading} onChanged={() => qc.invalidateQueries({ queryKey: ["bookings"] })} />
        )}
        {tab === "orders" && (
          <OrdersTable rows={orders.data ?? []} loading={orders.isLoading} onChanged={() => qc.invalidateQueries({ queryKey: ["orders"] })} />
        )}
        {tab === "contacts" && (
          <ContactsTable rows={contacts.data ?? []} loading={contacts.isLoading} onChanged={() => qc.invalidateQueries({ queryKey: ["contacts"] })} />
        )}
        {tab === "reviews" && (
          <ReviewsTable rows={reviews.data ?? []} loading={reviews.isLoading} onChanged={() => qc.invalidateQueries({ queryKey: ["reviews-admin"] })} />
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <div className="mt-2 font-serif text-3xl text-primary">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-4">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-2xl text-primary">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
      <h3 className="mb-4 font-serif text-lg text-primary">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TableShell({
  title,
  count,
  onExport,
  search,
  setSearch,
  filter,
  loading,
  children,
}: {
  title: string;
  count: number;
  onExport: () => void;
  search: string;
  setSearch: (s: string) => void;
  filter?: React.ReactNode;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-5">
        <div>
          <h2 className="font-serif text-xl text-primary">{title}</h2>
          <p className="text-xs text-muted-foreground">{count} total</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-48 rounded-full border border-input bg-background py-2 pl-8 pr-3 text-xs outline-none focus:border-accent"
            />
          </div>
          {filter}
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-gold px-4 py-2 text-xs font-medium text-primary-foreground shadow-soft"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
        ) : count === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No records yet.</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function BookingsTable({
  rows,
  loading,
  onChanged,
}: {
  rows: Booking[];
  loading: boolean;
  onChanged: () => void;
}) {
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("all");
  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const okQ =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phone.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q);
    const okE = eventType === "all" || r.event_type === eventType;
    return okQ && okE;
  });
  const del = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    onChanged();
  };
  return (
    <TableShell
      title="Bookings"
      count={filtered.length}
      loading={loading}
      onExport={() => exportToCSV(filtered, `bookings-${Date.now()}.csv`)}
      search={search}
      setSearch={setSearch}
      filter={
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="rounded-full border border-input bg-background px-3 py-2 text-xs outline-none"
        >
          <option value="all">All events</option>
          {["Bridal", "Engagement", "Sangeet", "Party", "Custom"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      }
    >
      <table className="w-full text-left text-sm">
        <thead className="bg-cream/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <Th>Name</Th>
            <Th>Contact</Th>
            <Th>Event</Th>
            <Th>Date</Th>
            <Th>Location</Th>
            <Th>Submitted</Th>
            <Th />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {filtered.map((r) => (
            <tr key={r.id}>
              <Td>
                <div className="font-medium text-foreground">{r.name}</div>
                {r.notes && <div className="text-xs text-muted-foreground">{r.notes}</div>}
              </Td>
              <Td>
                <div>{r.email}</div>
                <div className="text-xs text-muted-foreground">{r.phone}</div>
              </Td>
              <Td>{r.event_type}</Td>
              <Td>{fmt(r.event_date)}</Td>
              <Td>{r.location}</Td>
              <Td>{fmt(r.created_at)}</Td>
              <Td>
                <IconBtn onClick={() => del(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function OrdersTable({
  rows,
  loading,
  onChanged,
}: {
  rows: Order[];
  loading: boolean;
  onChanged: () => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const okQ =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phone.toLowerCase().includes(q) ||
      r.product_type.toLowerCase().includes(q);
    const okS = status === "all" || r.status === status;
    return okQ && okS;
  });
  const del = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    onChanged();
  };
  const setOrderStatus = async (id: string, s: Order["status"]) => {
    const { error } = await supabase.from("orders").update({ status: s }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${s}`);
    onChanged();
  };
  return (
    <TableShell
      title="Orders"
      count={filtered.length}
      loading={loading}
      onExport={() => exportToCSV(filtered, `orders-${Date.now()}.csv`)}
      search={search}
      setSearch={setSearch}
      filter={
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-full border border-input bg-background px-3 py-2 text-xs outline-none"
        >
          <option value="all">All statuses</option>
          <option>Pending</option>
          <option>Contacted</option>
          <option>Completed</option>
        </select>
      }
    >
      <table className="w-full text-left text-sm">
        <thead className="bg-cream/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <Th>Customer</Th>
            <Th>Contact</Th>
            <Th>Product</Th>
            <Th>Qty</Th>
            <Th>Status</Th>
            <Th>Submitted</Th>
            <Th />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {filtered.map((r) => (
            <tr key={r.id}>
              <Td>
                <div className="font-medium text-foreground">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.address}</div>
              </Td>
              <Td>
                <div>{r.email}</div>
                <div className="text-xs text-muted-foreground">{r.phone}</div>
              </Td>
              <Td>{r.product_type}</Td>
              <Td>{r.quantity}</Td>
              <Td>
                <select
                  value={r.status}
                  onChange={(e) => setOrderStatus(r.id, e.target.value as Order["status"])}
                  className={`rounded-full border px-3 py-1 text-xs outline-none ${
                    r.status === "Completed"
                      ? "border-green-500/30 bg-green-500/10 text-green-700"
                      : r.status === "Contacted"
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-700"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-700"
                  }`}
                >
                  <option>Pending</option>
                  <option>Contacted</option>
                  <option>Completed</option>
                </select>
              </Td>
              <Td>{fmt(r.created_at)}</Td>
              <Td>
                <IconBtn onClick={() => del(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function ContactsTable({
  rows,
  loading,
  onChanged,
}: {
  rows: Contact[];
  loading: boolean;
  onChanged: () => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.message.toLowerCase().includes(q)
    );
  });
  const del = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    onChanged();
  };
  return (
    <TableShell
      title="Contacts"
      count={filtered.length}
      loading={loading}
      onExport={() => exportToCSV(filtered, `contacts-${Date.now()}.csv`)}
      search={search}
      setSearch={setSearch}
    >
      <table className="w-full text-left text-sm">
        <thead className="bg-cream/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Message</Th>
            <Th>Submitted</Th>
            <Th />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {filtered.map((r) => (
            <tr key={r.id}>
              <Td>
                <div className="font-medium text-foreground">{r.name}</div>
                {r.phone && <div className="text-xs text-muted-foreground">{r.phone}</div>}
              </Td>
              <Td>{r.email}</Td>
              <Td className="max-w-md">
                <div className="line-clamp-3 whitespace-pre-wrap text-sm">{r.message}</div>
              </Td>
              <Td>{fmt(r.created_at)}</Td>
              <Td>
                <IconBtn onClick={() => del(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function ReviewsTable({
  rows,
  loading,
  onChanged,
}: {
  rows: Review[];
  loading: boolean;
  onChanged: () => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const okQ =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.review.toLowerCase().includes(q) ||
      (r.city ?? "").toLowerCase().includes(q);
    const okS =
      status === "all" ||
      (status === "approved" && r.approved) ||
      (status === "pending" && !r.approved);
    return okQ && okS;
  });
  const del = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    onChanged();
  };
  const toggle = async (r: Review) => {
    const { error } = await supabase
      .from("reviews")
      .update({ approved: !r.approved })
      .eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(!r.approved ? "Approved" : "Unapproved");
    onChanged();
  };
  return (
    <TableShell
      title="Reviews"
      count={filtered.length}
      loading={loading}
      onExport={() => exportToCSV(filtered, `reviews-${Date.now()}.csv`)}
      search={search}
      setSearch={setSearch}
      filter={
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-full border border-input bg-background px-3 py-2 text-xs outline-none"
        >
          <option value="all">All</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      }
    >
      <table className="w-full text-left text-sm">
        <thead className="bg-cream/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <Th>Name</Th>
            <Th>City</Th>
            <Th>Rating</Th>
            <Th>Review</Th>
            <Th>Status</Th>
            <Th>Submitted</Th>
            <Th />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {filtered.map((r) => (
            <tr key={r.id}>
              <Td className="font-medium text-foreground">{r.name}</Td>
              <Td>{r.city ?? "—"}</Td>
              <Td>
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </Td>
              <Td className="max-w-md">
                <div className="line-clamp-3 text-sm">{r.review}</div>
              </Td>
              <Td>
                <button
                  onClick={() => toggle(r)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    r.approved
                      ? "bg-green-500/10 text-green-700 hover:bg-green-500/20"
                      : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
                  }`}
                >
                  {r.approved ? "Approved" : "Pending"}
                </button>
              </Td>
              <Td>{fmt(r.created_at)}</Td>
              <Td>
                <IconBtn onClick={() => del(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-5 py-3 font-medium">{children}</th>;
}
function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-4 align-top ${className}`}>{children}</td>;
}
function IconBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-destructive/50 hover:text-destructive"
    >
      {children}
    </button>
  );
}
