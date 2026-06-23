import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Activity, Beaker, Layers, Pencil, Plus, Search, Tag, Trash2 } from "lucide-react";
import { Button, Card, EmptyState, Field, inputCls, Modal, SectionHeader, selectCls, StatCard, StatusBadge, textareaCls } from "../../components/lab/ui";
import { categories } from "../../lib/constants";
import { Link } from "../../lib/navigation";
import { useTests, testsStore } from "../../lib/tests-store";

export default function TestManagementPage() {
  useEffect(() => {
    document.title = "Test Management - Lab Admin";
    testsStore.fetchAll();
  }, []);

  const tests = useTests();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [query, setQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!query) return tests;
    const q = query.toLowerCase();
    return tests.filter(
      (test) =>
        test.code.toLowerCase().includes(q) ||
        test.name.toLowerCase().includes(q) ||
        test.category.toLowerCase().includes(q)
    );
  }, [tests, query]);

  const stats = useMemo(
    () => ({
      total: tests.length,
      active: tests.filter((test) => test.status === "Active").length,
      inactive: tests.filter((test) => test.status === "Inactive").length,
      avgPrice: tests.length
        ? Math.round(tests.reduce((sum, test) => sum + Number(test.price || 0), 0) / tests.length)
        : 0,
    }),
    [tests]
  );

  const categoryCounts = useMemo(() => {
    const counts = {};
    tests.forEach((t) => {
      const cat = t.category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [tests]);

  const dynamicCategories = useMemo(() => {
    const colorMap = {};
    categories.forEach((c) => { colorMap[c.name] = c.color; });
    const allCats = [...new Set([...Object.keys(categoryCounts), ...categories.map((c) => c.name)])];
    return allCats.map((name) => ({
      name,
      count: categoryCounts[name] || 0,
      color: colorMap[name] || "from-gray-500/15 to-gray-500/0",
    })).filter((c) => c.count > 0);
  }, [categoryCounts]);

  function openEdit(test) {
    setEditing(test);
    const { id, ...rest } = test;
    setForm(rest);
  }

  async function save() {
    if (!editing || !form || !form.code || !form.name) {
      toast.warning("Please fill in all required fields.");
      return;
    }
    toast.info("Saving test...");
    try {
      await testsStore.update(editing.id, form);
      toast.success("✓ Test updated successfully!");
      setEditing(null);
      setForm(null);
    } catch (e) {
      console.error("Failed to update test:", e);
      toast.error("✗ " + (e.message || "Failed to update test"));
    }
  }

  async function deleteTest(testId) {
    if (!window.confirm("Are you sure you want to delete this test?")) {
      toast.info("Delete cancelled.");
      return;
    }
    setIsDeleting(true);
    toast.info("Deleting test...");
    try {
      await testsStore.remove(testId);
      toast.success("✓ Test deleted successfully!");
    } catch (e) {
      console.error("Failed to delete test:", e);
      toast.error("✗ " + (e.message || "Failed to delete test"));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F9F6] -mx-4 -mt-4 p-4 sm:-mx-6 sm:-mt-6 sm:p-6 lg:-mx-8 lg:-mt-8 lg:p-8">
      <SectionHeader
        title="Test Management"
        subtitle="Maintain your diagnostic test catalog, pricing and turnaround times."
        action={
          <Link to="/lab/add-test">
            <Button>
              <Plus className="size-4" /> Add New Test
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Tests" value={stats.total} icon={<Beaker className="size-5" />} hint="In catalog" />
        <StatCard
          label="Active"
          value={stats.active}
          tone="success"
          icon={<Activity className="size-5" />}
          hint="Available to order"
        />
        <StatCard
          label="Inactive"
          value={stats.inactive}
          tone="warning"
          icon={<Tag className="size-5" />}
          hint="Hidden from order page"
        />
        <StatCard
          label="Avg Price"
          value={`Rs.${stats.avgPrice}`}
          tone="info"
          icon={<Layers className="size-5" />}
          hint="Across catalog"
        />
      </div>

      <Card className="mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-semibold text-foreground text-[15px]">Test Catalog</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} of {tests.length} tests
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search
              className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
              strokeWidth={1.75}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search code, name or category..."
              className={inputCls + " pl-9"}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-100 bg-white">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                {["Code", "Test Name", "Category", "Sample", "Method", "TAT", "Price", "Status", ""].map((header, index) => (
                  <th key={index} className="px-4 py-3 font-semibold first:pl-5 last:pr-5">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      title="No tests found"
                      hint="Try adjusting your search."
                      icon={<Search className="size-5" />}
                    />
                  </td>
                </tr>
              )}
              {filtered.map((test) => (
                <tr key={test.id} className="border-t border-border/60 row-hover">
                  <td className="px-4 py-3.5 pl-5 font-mono text-[12px] text-primary font-medium">
                    {test.code}
                  </td>
                  <td className="px-4 py-3.5 max-w-[260px]">
                    <div className="font-medium text-foreground">{test.name}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">
                      {test.description}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-foreground">{test.category}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{test.sampleType}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{test.method}</td>
                  <td className="px-4 py-3.5 text-muted-foreground tabular-nums">{test.tat}</td>
                  <td className="px-4 py-3.5 text-foreground font-medium tabular-nums">
                    Rs.{test.price}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={test.status} />
                  </td>
                  <td className="px-4 py-3.5 pr-5">
                    <div className="flex gap-1 justify-end">
                      <button
                        aria-label="Edit"
                        onClick={() => openEdit(test)}
                        className="size-8 rounded-lg hover:bg-secondary grid place-items-center text-muted-foreground hover:text-primary transition"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        aria-label="Delete"
                        onClick={() => deleteTest(test.id)}
                        disabled={isDeleting}
                        className="size-8 rounded-lg hover:bg-destructive/10 grid place-items-center text-muted-foreground hover:text-destructive transition disabled:opacity-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="font-semibold text-foreground text-[15px]">Test Categories</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Group your catalog by clinical discipline.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {dynamicCategories.map((category) => (
            <div
              key={category.name}
              className="group relative overflow-hidden bg-card rounded-2xl border border-border shadow-soft p-4 hover:shadow-glass hover:-translate-y-0.5 transition-all duration-200"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.color} pointer-events-none opacity-60 group-hover:opacity-100 transition`}
              />
              <div className="relative">
                <div className="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center mb-3">
                  <Beaker className="size-4" />
                </div>
                <div className="text-sm font-medium text-foreground">{category.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {category.count} tests
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={!!editing}
        onClose={() => {
          setEditing(null);
          setForm(null);
        }}
        title={editing ? `Edit ${editing.name}` : ""}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null);
                setForm(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={save}>Save changes</Button>
          </>
        }
      >
        {form && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Test Code">
              <input
                className={inputCls}
                value={form.code}
                onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
              />
            </Field>
            <Field label="Test Name">
              <input
                className={inputCls}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </Field>
            <Field label="Category">
              <select
                className={selectCls}
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              >
                {categories.map((category) => (
                  <option key={category.name}>{category.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Sample Type">
              <input
                className={inputCls}
                value={form.sampleType}
                onChange={(event) => setForm({ ...form, sampleType: event.target.value })}
              />
            </Field>
            <Field label="Price (Rs.)">
              <input
                type="number"
                className={inputCls}
                value={form.price}
                onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
              />
            </Field>
            <Field label="Turnaround Time (TAT)">
              <input
                className={inputCls}
                value={form.tat}
                onChange={(event) => setForm({ ...form, tat: event.target.value })}
              />
            </Field>
            <Field label="Method">
              <input
                className={inputCls}
                value={form.method}
                onChange={(event) => setForm({ ...form, method: event.target.value })}
              />
            </Field>
            <Field label="Status">
              <select
                className={selectCls}
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <textarea
                  rows={3}
                  className={textareaCls}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </Field>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
