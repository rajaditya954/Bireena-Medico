import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Beaker, Save } from "lucide-react";
import { Button, Field, inputCls, SectionHeader, selectCls, textareaCls } from "../../components/lab/ui";
import { categories } from "../../lib/constants";
import { Link, navigate } from "../../lib/navigation";
import { testsStore } from "../../lib/tests-store";
import { labApi } from "../../services/labService";

const empty = {
  code: "",
  name: "",
  category: "Biochemistry",
  sampleType: "",
  price: 0,
  tat: "6 hrs",
  method: "",
  description: "",
  normalRange: "",
  status: "Active",
};

export default function AddTestPage() {
  useEffect(() => {
    document.title = "Add Lab Test - Lab Admin";
  }, []);

  const [form, setForm] = useState(empty);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function save(event) {
    event.preventDefault();
    if (!form.code || !form.name) {
      toast.warning("Please fill in test code and name.");
      return;
    }

    setIsSaving(true);
    try {
      toast.info("Checking if test code exists...");
      const existingTests = await labApi.getTests();
      const duplicate = existingTests.find(t => t.code === form.code);
      
      if (duplicate) {
        toast.error(`✗ Test code "${form.code}" already exists! Use a different code.`);
        setIsSaving(false);
        return;
      }

      toast.info("Creating new test...");
      await testsStore.add(form);
      toast.success("✓ Test created successfully!");
      setSaved(true);
      setTimeout(() => navigate("/lab/tests"), 700);
    } catch (e) {
      console.error("Failed to create test:", e);
      toast.error("✗ " + (e.message || "Failed to create test"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F9F6] -mx-4 -mt-4 p-4 sm:-mx-6 sm:-mt-6 sm:p-6 lg:-mx-8 lg:-mt-8 lg:p-8">
      <SectionHeader
        title="Add New Lab Test"
        subtitle="Create a diagnostic test entry for your catalog."
        action={
          <Link to="/lab/tests">
            <Button variant="outline">
              <ArrowLeft className="size-4" /> Back to catalog
            </Button>
          </Link>
        }
      />

      <form onSubmit={save} className="bg-card rounded-3xl border border-border shadow-soft p-6 sm:p-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border">
          <div className="size-11 rounded-2xl bg-[#0B4B34] text-white grid place-items-center">
            <Beaker className="size-5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Test Details</h2>
            <p className="text-xs text-muted-foreground">
              Fill in the diagnostic test information below.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Test Code">
            <input
              className={inputCls}
              value={form.code}
              onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
              placeholder="e.g. CBC"
              required
            />
          </Field>
          <Field label="Test Name">
            <input
              className={inputCls}
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Complete Blood Count"
              required
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
              placeholder="Serum / Whole Blood / Urine"
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
          <Field label="Normal Range">
            <input
              className={inputCls}
              value={form.normalRange}
              onChange={(event) => setForm({ ...form, normalRange: event.target.value })}
              placeholder="e.g. 4.5-11 x10^9/L"
            />
          </Field>
          <Field label="Turnaround Time (TAT)">
            <input
              className={inputCls}
              value={form.tat}
              onChange={(event) => setForm({ ...form, tat: event.target.value })}
              placeholder="4 hrs"
            />
          </Field>
          <Field label="Method">
            <input
              className={inputCls}
              value={form.method}
              onChange={(event) => setForm({ ...form, method: event.target.value })}
              placeholder="CLIA / HPLC / Spectrophotometry"
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
                rows={4}
                className={textareaCls}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="What this test measures and clinical significance..."
              />
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-7 pt-5 border-t border-border">
          {saved && (
            <span className="text-sm text-[color:var(--success)] mr-auto">
              Test added successfully
            </span>
          )}
          <Link to="/lab/tests">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSaving}>
            <Save className="size-4" /> Save Test
          </Button>
        </div>
      </form>
    </div>
  );
}
