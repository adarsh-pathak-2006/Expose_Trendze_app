const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageBreak
} = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const headBorder = { style: BorderStyle.SINGLE, size: 4, color: "C8973A" };
const headBorders = { top: headBorder, bottom: headBorder, left: headBorder, right: headBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, bold: true, size: 36, color: "1A1A2E" })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, color: "C8973A" })]
  });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, size: 22, color: opts.color || "333333", bold: opts.bold || false })]
  });
}
function code(text) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 360 },
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "1A1A2E" })]
  });
}
function divider() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "C8973A", space: 1 } },
    children: []
  });
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}
function tableHeader(text) {
  return new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20 })] });
}
function tableCell(text, shade) {
  return new Paragraph({ children: [new TextRun({ text, size: 19, color: "222222", font: "Courier New" })] });
}

function schemaTable(tableName, columns) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2200, 1600, 800, 4760],
    rows: [
      new TableRow({
        tableHeader: true,
        children: ["Column Name", "Type", "Nullable", "Description / Constraints"].map((h, i) =>
          new TableCell({
            borders: headBorders,
            width: { size: [2200, 1600, 800, 4760][i], type: WidthType.DXA },
            shading: { fill: "1A1A2E", type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "C8973A", size: 19 })] })]
          })
        )
      }),
      ...columns.map((col, ri) => new TableRow({
        children: col.map((cell, i) => new TableCell({
          borders,
          width: { size: [2200, 1600, 800, 4760][i], type: WidthType.DXA },
          shading: { fill: ri % 2 === 0 ? "F9F6EE" : "FFFFFF", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18, font: "Courier New", color: "222222" })] })]
        }))
      }))
    ]
  });
}

const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    }]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "1A1A2E" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "C8973A" },
        paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    children: [
      new Paragraph({ spacing: { before: 400, after: 100 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "EXPOSE TRENDZE — ET Customer App", bold: true, size: 44, color: "1A1A2E" })] }),
      new Paragraph({ spacing: { before: 0, after: 400 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Database Schema & SQL Reference", size: 30, color: "C8973A" })] }),
      divider(),

      h1("Overview"),
      p("All data is stored in PostgreSQL via Supabase. Every table has Row Level Security (RLS) enabled. Customers can only read their own data. The admin manages data via Supabase Dashboard or a separate admin tool."),
      new Paragraph({ spacing: { before: 80, after: 80 },
        children: [new TextRun({ text: "Database: ", bold: true, size: 22 }), new TextRun({ text: "PostgreSQL 15 (Supabase managed)", size: 22, color: "555555" })] }),
      new Paragraph({ spacing: { before: 80, after: 80 },
        children: [new TextRun({ text: "Auth: ", bold: true, size: 22 }), new TextRun({ text: "Supabase Auth (built-in auth.users table)", size: 22, color: "555555" })] }),
      divider(),

      h1("Table 1: customers"),
      p("Stores customer profile data. Links to Supabase auth.users via user_id (UUID)."),
      schemaTable("customers", [
        ["id", "UUID", "NO", "Primary Key, default: gen_random_uuid()"],
        ["user_id", "UUID", "NO", "FK → auth.users(id), UNIQUE — links auth to profile"],
        ["full_name", "TEXT", "NO", "Customer's full name"],
        ["email", "TEXT", "NO", "UNIQUE — same as auth email"],
        ["phone", "TEXT", "YES", "Customer phone number"],
        ["company_name", "TEXT", "YES", "Customer's business name"],
        ["country", "TEXT", "YES", "Customer's country"],
        ["is_active", "BOOLEAN", "NO", "default: true — admin can deactivate"],
        ["created_at", "TIMESTAMPTZ", "NO", "default: now()"],
        ["updated_at", "TIMESTAMPTZ", "YES", "Last profile update timestamp"],
      ]),
      divider(),

      h1("Table 2: orders"),
      p("One row per order placed by a customer."),
      schemaTable("orders", [
        ["id", "UUID", "NO", "Primary Key, default: gen_random_uuid()"],
        ["customer_id", "UUID", "NO", "FK → customers(id)"],
        ["order_number", "TEXT", "NO", "UNIQUE — human-readable ID e.g. ET-2024-001"],
        ["status", "TEXT", "NO", "Current status (mirrors latest order_stages entry)"],
        ["total_amount", "NUMERIC(10,2)", "NO", "Total order value"],
        ["currency", "TEXT", "NO", "default: 'USD'"],
        ["payment_status", "TEXT", "NO", "pending / paid / partial / overdue"],
        ["notes", "TEXT", "YES", "Admin notes (not shown to customer)"],
        ["expected_delivery", "DATE", "YES", "Estimated delivery date"],
        ["placed_at", "TIMESTAMPTZ", "NO", "default: now()"],
        ["updated_at", "TIMESTAMPTZ", "YES", "Last order update timestamp"],
      ]),
      divider(),

      h1("Table 3: order_items"),
      p("Line items within each order. One order can have multiple products."),
      schemaTable("order_items", [
        ["id", "UUID", "NO", "Primary Key, default: gen_random_uuid()"],
        ["order_id", "UUID", "NO", "FK → orders(id), ON DELETE CASCADE"],
        ["product_name", "TEXT", "NO", "Name/description of the product"],
        ["sku", "TEXT", "YES", "Product SKU or reference code"],
        ["quantity", "INTEGER", "NO", "Number of units"],
        ["unit_price", "NUMERIC(10,2)", "NO", "Price per unit"],
        ["total_price", "NUMERIC(10,2)", "NO", "quantity × unit_price"],
        ["specifications", "JSONB", "YES", "Size, color, material details as JSON"],
      ]),
      divider(),

      h1("Table 4: order_stages"),
      p("Tracks each stage of an order's production and shipping lifecycle. Admin inserts new rows to advance the order."),
      schemaTable("order_stages", [
        ["id", "UUID", "NO", "Primary Key, default: gen_random_uuid()"],
        ["order_id", "UUID", "NO", "FK → orders(id), ON DELETE CASCADE"],
        ["stage_number", "INTEGER", "NO", "1–11 (maps to the 11 defined stages)"],
        ["stage_name", "TEXT", "NO", "Human-readable stage name"],
        ["stage_note", "TEXT", "YES", "Optional admin note for this stage update"],
        ["is_completed", "BOOLEAN", "NO", "default: true when inserted"],
        ["completed_at", "TIMESTAMPTZ", "NO", "default: now()"],
        ["updated_by", "TEXT", "YES", "Admin identifier who updated this stage"],
      ]),
      divider(),

      h1("Complete SQL — Copy & Run in Supabase SQL Editor"),
      p("Run this SQL in order in the Supabase SQL Editor to set up the entire database."),

      new Paragraph({ spacing: { before: 200, after: 60 },
        children: [new TextRun({ text: "-- STEP 1: Enable UUID extension", bold: true, font: "Courier New", size: 18, color: "C8973A" })] }),
      code("CREATE EXTENSION IF NOT EXISTS pgcrypto;"),

      new Paragraph({ spacing: { before: 200, after: 60 },
        children: [new TextRun({ text: "-- STEP 2: customers table", bold: true, font: "Courier New", size: 18, color: "C8973A" })] }),
      code("CREATE TABLE public.customers ("),
      code("  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),"),
      code("  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,"),
      code("  full_name TEXT NOT NULL,"),
      code("  email TEXT UNIQUE NOT NULL,"),
      code("  phone TEXT,"),
      code("  company_name TEXT,"),
      code("  country TEXT,"),
      code("  is_active BOOLEAN NOT NULL DEFAULT true,"),
      code("  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),"),
      code("  updated_at TIMESTAMPTZ"),
      code(");"),

      new Paragraph({ spacing: { before: 200, after: 60 },
        children: [new TextRun({ text: "-- STEP 3: orders table", bold: true, font: "Courier New", size: 18, color: "C8973A" })] }),
      code("CREATE TABLE public.orders ("),
      code("  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),"),
      code("  customer_id UUID NOT NULL REFERENCES public.customers(id),"),
      code("  order_number TEXT UNIQUE NOT NULL,"),
      code("  status TEXT NOT NULL DEFAULT 'Order Received',"),
      code("  total_amount NUMERIC(10,2) NOT NULL,"),
      code("  currency TEXT NOT NULL DEFAULT 'USD',"),
      code("  payment_status TEXT NOT NULL DEFAULT 'pending',"),
      code("  notes TEXT,"),
      code("  expected_delivery DATE,"),
      code("  placed_at TIMESTAMPTZ NOT NULL DEFAULT now(),"),
      code("  updated_at TIMESTAMPTZ"),
      code(");"),

      new Paragraph({ spacing: { before: 200, after: 60 },
        children: [new TextRun({ text: "-- STEP 4: order_items table", bold: true, font: "Courier New", size: 18, color: "C8973A" })] }),
      code("CREATE TABLE public.order_items ("),
      code("  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),"),
      code("  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,"),
      code("  product_name TEXT NOT NULL,"),
      code("  sku TEXT,"),
      code("  quantity INTEGER NOT NULL,"),
      code("  unit_price NUMERIC(10,2) NOT NULL,"),
      code("  total_price NUMERIC(10,2) NOT NULL,"),
      code("  specifications JSONB"),
      code(");"),

      new Paragraph({ spacing: { before: 200, after: 60 },
        children: [new TextRun({ text: "-- STEP 5: order_stages table", bold: true, font: "Courier New", size: 18, color: "C8973A" })] }),
      code("CREATE TABLE public.order_stages ("),
      code("  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),"),
      code("  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,"),
      code("  stage_number INTEGER NOT NULL CHECK (stage_number BETWEEN 1 AND 11),"),
      code("  stage_name TEXT NOT NULL,"),
      code("  stage_note TEXT,"),
      code("  is_completed BOOLEAN NOT NULL DEFAULT true,"),
      code("  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),"),
      code("  updated_by TEXT"),
      code(");"),

      new Paragraph({ spacing: { before: 200, after: 60 },
        children: [new TextRun({ text: "-- STEP 6: Enable Row Level Security", bold: true, font: "Courier New", size: 18, color: "C8973A" })] }),
      code("ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;"),
      code("ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;"),
      code("ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;"),
      code("ALTER TABLE public.order_stages ENABLE ROW LEVEL SECURITY;"),

      new Paragraph({ spacing: { before: 200, after: 60 },
        children: [new TextRun({ text: "-- STEP 7: RLS Policies (customers see only their data)", bold: true, font: "Courier New", size: 18, color: "C8973A" })] }),
      code("CREATE POLICY \"customers_own\" ON public.customers"),
      code("  FOR SELECT USING (auth.uid() = user_id);"),
      p(""),
      code("CREATE POLICY \"orders_own\" ON public.orders"),
      code("  FOR SELECT USING ("),
      code("    customer_id IN ("),
      code("      SELECT id FROM public.customers WHERE user_id = auth.uid()"),
      code("    )"),
      code("  );"),
      p(""),
      code("CREATE POLICY \"order_items_own\" ON public.order_items"),
      code("  FOR SELECT USING ("),
      code("    order_id IN ("),
      code("      SELECT o.id FROM public.orders o"),
      code("      JOIN public.customers c ON c.id = o.customer_id"),
      code("      WHERE c.user_id = auth.uid()"),
      code("    )"),
      code("  );"),
      p(""),
      code("CREATE POLICY \"order_stages_own\" ON public.order_stages"),
      code("  FOR SELECT USING ("),
      code("    order_id IN ("),
      code("      SELECT o.id FROM public.orders o"),
      code("      JOIN public.customers c ON c.id = o.customer_id"),
      code("      WHERE c.user_id = auth.uid()"),
      code("    )"),
      code("  );"),
      divider(),

      h1("Realtime Setup"),
      p("Enable Realtime on the order_stages table so the app gets instant updates when admin changes a stage:"),
      code("-- Run in Supabase SQL Editor:"),
      code("ALTER PUBLICATION supabase_realtime ADD TABLE public.order_stages;"),
      code("ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;"),
      p("Then in the app (React Native), subscribe to changes:"),
      code("supabase"),
      code("  .channel('order-updates')"),
      code("  .on('postgres_changes', {"),
      code("    event: '*', schema: 'public', table: 'order_stages',"),
      code("    filter: `order_id=eq.${orderId}`"),
      code("  }, handleUpdate)"),
      code("  .subscribe();"),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/mnt/user-data/outputs/02_ET_Database_Schema.docx', buf);
  console.log('Done: 02_ET_Database_Schema.docx');
});
