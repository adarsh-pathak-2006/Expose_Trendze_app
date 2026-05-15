const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageBreak
} = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const thickBorder = { style: BorderStyle.SINGLE, size: 4, color: "1A1A2E" };
const thickBorders = { top: thickBorder, bottom: thickBorder, left: thickBorder, right: thickBorder };

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
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, color: "1A1A2E" })]
  });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, size: 22, color: opts.color || "333333", bold: opts.bold || false })]
  });
}
function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 22, color: "333333" })]
  });
}
function note(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    indent: { left: 360 },
    children: [new TextRun({ text: `⚠️  ${text}`, size: 20, color: "8B0000", bold: true })]
  });
}
function codeBlock(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: 360 },
    shading: { fill: "F4F4F4", type: ShadingType.CLEAR },
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

function makeTable(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => new TableCell({
          borders: thickBorders,
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { fill: "1A1A2E", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 150, right: 150 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20 })] })]
        }))
      }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, i) => new TableCell({
          borders,
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { fill: ri % 2 === 0 ? "FAFAFA" : "FFFFFF", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 150, right: 150 },
          children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, color: "333333" })] })]
        }))
      }))
    ]
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
      }
    ]
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
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "1A1A2E" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // COVER
      new Paragraph({ spacing: { before: 600, after: 200 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "EXPOSE TRENDZE", bold: true, size: 56, color: "1A1A2E" })] }),
      new Paragraph({ spacing: { before: 0, after: 100 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Customer Mobile Application", size: 36, color: "C8973A" })] }),
      new Paragraph({ spacing: { before: 0, after: 400 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Master Project Specification Document", size: 26, color: "666666" })] }),
      divider(),
      makeTable(
        ["Field", "Value"],
        [
          ["Project", "ET Customer App (Expose Trendze Customer Application)"],
          ["Developer", "Adarsh"],
          ["Assigned By", "Shan"],
          ["Clarifications Contact", "Sansar"],
          ["Frontend Framework", "React Native (Expo)"],
          ["Backend", "Supabase (PostgreSQL + Auth + Realtime)"],
          ["Document Version", "1.0"],
          ["Status", "Ready for Development"],
        ],
        [2800, 6560]
      ),
      pageBreak(),

      // SECTION 1
      h1("1. Project Overview"),
      p("The ET Customer App is a dedicated mobile application for Expose Trendze (ET) customers. It allows authorized customers to log in securely, track their orders in real time, view order history, and manage their account — all in a premium, brand-consistent UI."),
      p("This is a closed system. Customers cannot register themselves. All accounts are created exclusively by the ET admin team."),
      divider(),

      h1("2. Tech Stack"),
      makeTable(
        ["Layer", "Technology", "Purpose"],
        [
          ["Frontend", "React Native + Expo", "Cross-platform iOS & Android app"],
          ["Backend", "Supabase", "Auth, DB, Realtime, Storage"],
          ["Database", "PostgreSQL (via Supabase)", "All persistent data"],
          ["Authentication", "Supabase Auth (email+password)", "Secure login, session management"],
          ["Realtime", "Supabase Realtime (websockets)", "Live order status updates"],
          ["State Mgmt", "Zustand", "Lightweight global state"],
          ["Navigation", "React Navigation v6", "Stack + Tab navigation"],
          ["HTTP Client", "Supabase JS Client", "All API calls"],
          ["Storage", "AsyncStorage", "Persist session token"],
          ["Icons", "React Native Vector Icons", "UI icons"],
          ["Date Utils", "date-fns", "Date formatting"],
          ["Env Config", ".env + expo-constants", "API keys management"],
        ],
        [2200, 2800, 4360]
      ),
      divider(),

      h1("3. Application Screens & Features"),

      h2("3.1 Login Screen"),
      p("The entry point of the app. No sign-up option exists anywhere."),
      bullet("Email + Password fields"),
      bullet("'Forgot Password' button (shows email submission form — optional, activate on admin approval)"),
      bullet("ET logo and brand identity at top"),
      bullet("Error messages for invalid credentials"),
      bullet("Secure session saved to AsyncStorage after login"),
      bullet("On app open: auto-redirect to Dashboard if session is valid"),
      note("NO sign-up/register button or link anywhere in the app"),

      h2("3.2 Customer Dashboard (Home Screen)"),
      p("First screen after login. Clean, card-based layout showing order summary."),
      bullet("Customer greeting with name: 'Welcome back, [Name]'"),
      bullet("Active Orders count badge"),
      bullet("Cards for each active order showing: Order ID, product name, current status, last updated"),
      bullet("Quick-access buttons: Order History, Track Order"),
      bullet("Pull-to-refresh support"),
      bullet("Logout button in header"),

      h2("3.3 Order History Screen"),
      p("Complete list of all past and current orders."),
      bullet("Chronological list of all orders (newest first)"),
      bullet("Each row: Order ID, date, product name, quantity, price, status badge"),
      bullet("Search bar to filter by Order ID or product name"),
      bullet("Filter by status: All / Active / Completed / Cancelled"),
      bullet("Tap on any order to open Order Detail screen"),

      h2("3.4 Order Detail Screen"),
      p("Full details of a single order."),
      bullet("Order ID, date placed, expected delivery"),
      bullet("Product list with quantities and per-unit price"),
      bullet("Total order value"),
      bullet("Payment status badge"),
      bullet("'Track This Order' CTA button leading to tracking screen"),
      bullet("Timeline of status history (past updates)"),

      h2("3.5 Live Order Tracking Screen"),
      p("The most important screen. Shows the 11-stage order pipeline with real-time updates."),
      p("Order stages (in sequence):", { bold: true }),
      makeTable(
        ["#", "Stage Name", "Description"],
        [
          ["1", "Order Received", "Order has been confirmed and registered in the system"],
          ["2", "Raw Material / Leather Received", "Materials sourced and received at factory"],
          ["3", "Manufacturing Started", "Production line has begun work on this order"],
          ["4", "Product in Production", "Active manufacturing underway"],
          ["5", "Quality Check in Progress", "QC team inspecting finished product"],
          ["6", "Packaging Started", "Products being packaged for shipment"],
          ["7", "Order Dispatched from India", "Shipment has left the factory/India"],
          ["8", "Shipment in Transit", "Package is in international transit"],
          ["9", "Customs / International Transit", "Clearing customs (if applicable)"],
          ["10", "Out for Delivery", "Package with last-mile delivery agent"],
          ["11", "Delivered", "Order delivered to customer"],
        ],
        [500, 3200, 5660]
      ),
      p("UI: Vertical stepper/timeline. Completed stages shown in gold. Current stage animated/pulsing. Future stages grayed out."),
      p("Realtime: Supabase Realtime subscription updates the UI instantly when admin changes a stage."),

      h2("3.6 Profile / Account Screen"),
      bullet("Customer name, email, phone number (read-only)"),
      bullet("App version info"),
      bullet("Logout button"),
      bullet("Contact support link (opens email to info@exposetrendze.in)"),
      divider(),

      h1("4. Admin Control Requirements"),
      note("Admin panel is NOT part of this app. This is managed via Supabase Dashboard or a separate admin tool."),
      bullet("Disable public signups in Supabase: Auth > Settings > Disable 'Enable Signups'"),
      bullet("Admin creates customer accounts via Supabase Dashboard: Authentication > Users > Invite User"),
      bullet("Admin can disable/delete accounts from Supabase Dashboard"),
      bullet("Row Level Security (RLS) on all tables: customers can only see their own data"),
      bullet("Order stages are updated only by admin — customers have read-only access"),
      divider(),

      h1("5. Security Requirements"),
      bullet("Supabase RLS policies on every table — no customer can access another customer's data"),
      bullet("No public registration — Supabase signups disabled"),
      bullet("JWT token stored in AsyncStorage, refreshed automatically by Supabase client"),
      bullet("All API calls go through Supabase client (no raw HTTP with API key on client)"),
      bullet("Supabase anon key used on client — service_role key NEVER exposed"),
      bullet("Session timeout handled gracefully — user redirected to Login on expiry"),
      divider(),

      h1("6. Deliverables Checklist"),
      makeTable(
        ["#", "Deliverable", "Notes"],
        [
          ["1", "Complete React Native source code", "Well-structured, commented, scalable"],
          ["2", "Working APK (Android)", "Built via Expo EAS Build"],
          ["3", "Supabase project setup", "Tables, RLS policies, Auth config"],
          ["4", "Database schema SQL file", "All CREATE TABLE statements"],
          ["5", "Admin setup guide", "How to add/manage customers"],
          ["6", "Developer setup documentation", "Clone, install, run instructions"],
          ["7", "Live demo / test credentials", "Test account for review"],
        ],
        [500, 3500, 5360]
      ),
      divider(),

      h1("7. Development Guidelines"),
      bullet("Use functional components and React hooks throughout"),
      bullet("Folder structure: /screens, /components, /hooks, /store, /services, /constants, /assets"),
      bullet("All Supabase logic in /services/supabase.js — never inline in screens"),
      bullet("Use Zustand for global state (auth, orders)"),
      bullet("Consistent error handling: try/catch on all async calls, user-visible error toasts"),
      bullet("No hardcoded strings — use a constants file for labels, colors, endpoints"),
      bullet("Test on both Android and iOS simulators before delivery"),
      bullet("All sensitive keys in .env file — never commit to git"),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/mnt/user-data/outputs/01_ET_Master_Spec.docx', buf);
  console.log('Done: 01_ET_Master_Spec.docx');
});
