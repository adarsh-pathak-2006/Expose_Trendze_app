const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageBreak
} = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" };
const borders = { top: border, bottom: border, left: border, right: border };
const goldBorder = { style: BorderStyle.SINGLE, size: 4, color: "C8973A" };
const goldBorders = { top: goldBorder, bottom: goldBorder, left: goldBorder, right: goldBorder };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, bold: true, size: 36, color: "1A1A2E" })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, color: "C8973A" })] });
}
function p(text, opts = {}) {
  return new Paragraph({ spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, size: 22, color: opts.color || "333333", bold: opts.bold || false })] });
}
function bullet(text) {
  return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 22, color: "333333" })] });
}
function code(text) {
  return new Paragraph({ spacing: { before: 40, after: 40 }, indent: { left: 360 },
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "1A1A2E" })] });
}
function divider() {
  return new Paragraph({ spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "C8973A", space: 1 } }, children: [] });
}
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }

function colorSwatch(hex, name, usage) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1200, 2000, 6160],
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: goldBorders, width: { size: 1200, type: WidthType.DXA },
          shading: { fill: hex, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: " ", size: 22 })] })]
        }),
        new TableCell({
          borders, width: { size: 2000, type: WidthType.DXA },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: `#${hex}`, font: "Courier New", size: 20, bold: true, color: "1A1A2E" })] })]
        }),
        new TableCell({
          borders, width: { size: 6160, type: WidthType.DXA },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          children: [
            new Paragraph({ children: [new TextRun({ text: name, bold: true, size: 20, color: "1A1A2E" })] }),
            new Paragraph({ children: [new TextRun({ text: usage, size: 18, color: "666666" })] })
          ]
        })
      ]
    })]
  });
}

function simpleTable(headers, rows, colWidths) {
  return new Table({
    width: { size: colWidths.reduce((a,b)=>a+b,0), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h,i) => new TableCell({
        borders: goldBorders, width: { size: colWidths[i], type: WidthType.DXA },
        shading: { fill: "1A1A2E", type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "C8973A", size: 19 })] })]
      }))]),
      ...rows.map((row, ri) => new TableRow({ children: row.map((cell, i) => new TableCell({
        borders, width: { size: colWidths[i], type: WidthType.DXA },
        shading: { fill: ri % 2 === 0 ? "FDFAF4" : "FFFFFF", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: cell, size: 19, color: "333333" })] })]
      }))}))
    ]
  });
}

const doc = new Document({
  numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•",
    alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
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
        children: [new TextRun({ text: "UI / UX Design System & Style Guide", size: 30, color: "C8973A" })] }),
      divider(),

      h1("1. Brand Identity"),
      p("The ET Customer App must feel like a premium extension of the Expose Trendze brand. The website (exposetrendze.in) uses a rich, dark navy base with gold accents — communicating luxury, craftsmanship, and professionalism. The app must mirror this exactly."),
      p("Brand personality:", { bold: true }),
      bullet("Premium leather goods manufacturer — think high-end, artisanal"),
      bullet("International exporter — trustworthy, precise, reliable"),
      bullet("B2B focused — clean data presentation, no fluff"),
      bullet("Elegant, not flashy — gold accents used sparingly for impact"),
      divider(),

      h1("2. Color Palette"),
      p("Use these exact colors everywhere. Never deviate."),
      new Paragraph({ spacing: { before: 120, after: 120 }, children: [] }),
      colorSwatch("1A1A2E", "Deep Navy (Primary Background)", "Main background, headers, nav bar, cards background"),
      new Paragraph({ spacing: { before: 60, after: 60 }, children: [] }),
      colorSwatch("C8973A", "Burnished Gold (Primary Accent)", "CTAs, active states, highlights, progress indicators"),
      new Paragraph({ spacing: { before: 60, after: 60 }, children: [] }),
      colorSwatch("FFFFFF", "Pure White (Primary Text)", "All body text on dark backgrounds"),
      new Paragraph({ spacing: { before: 60, after: 60 }, children: [] }),
      colorSwatch("F9F6EE", "Warm Cream (Surface)", "Card backgrounds, input fields, list item backgrounds"),
      new Paragraph({ spacing: { before: 60, after: 60 }, children: [] }),
      colorSwatch("2C2C54", "Dark Indigo (Secondary Surface)", "Elevated cards, modals, bottom sheets"),
      new Paragraph({ spacing: { before: 60, after: 60 }, children: [] }),
      colorSwatch("A0A0A0", "Muted Gray (Secondary Text)", "Subtitles, captions, placeholder text"),
      new Paragraph({ spacing: { before: 60, after: 60 }, children: [] }),
      colorSwatch("27AE60", "Success Green", "Delivered, Paid, Active status badges"),
      new Paragraph({ spacing: { before: 60, after: 60 }, children: [] }),
      colorSwatch("E74C3C", "Alert Red", "Overdue, Cancelled, Error states"),
      new Paragraph({ spacing: { before: 60, after: 60 }, children: [] }),
      colorSwatch("F39C12", "Amber (In Progress)", "Pending, In Transit, In Progress status badges"),
      divider(),

      h1("3. Typography"),
      simpleTable(
        ["Element", "Font", "Size", "Weight", "Color"],
        [
          ["App Title / Logo Text", "Playfair Display", "28sp", "Bold", "#C8973A (gold)"],
          ["Screen Heading (H1)", "Playfair Display", "24sp", "Bold", "#FFFFFF"],
          ["Section Heading (H2)", "Montserrat", "18sp", "SemiBold", "#C8973A"],
          ["Card Title", "Montserrat", "16sp", "SemiBold", "#FFFFFF"],
          ["Body Text", "Montserrat", "14sp", "Regular", "#FFFFFF"],
          ["Secondary / Caption", "Montserrat", "12sp", "Regular", "#A0A0A0"],
          ["Button Label", "Montserrat", "15sp", "Bold", "#1A1A2E or #FFFFFF"],
          ["Input Label", "Montserrat", "13sp", "Medium", "#A0A0A0"],
          ["Order Number / Code", "Courier New (Mono)", "13sp", "Regular", "#C8973A"],
          ["Status Badge Text", "Montserrat", "11sp", "Bold", "#FFFFFF"],
        ],
        [2400, 2000, 1000, 1400, 2560]
      ),
      p("Install fonts in Expo:", { bold: true }),
      code("npx expo install expo-font @expo-google-fonts/playfair-display"),
      code("npx expo install @expo-google-fonts/montserrat"),
      divider(),

      h1("4. Spacing & Layout System"),
      p("Use an 8pt spacing system consistently throughout the app."),
      simpleTable(
        ["Token", "Value", "Usage"],
        [
          ["spacing.xs", "4dp", "Icon padding, tiny gaps"],
          ["spacing.sm", "8dp", "Inner card padding, between label and value"],
          ["spacing.md", "16dp", "Standard padding, between cards"],
          ["spacing.lg", "24dp", "Section separators, screen horizontal padding"],
          ["spacing.xl", "32dp", "Top of screen padding, large gaps"],
          ["spacing.xxl", "48dp", "Hero sections"],
          ["borderRadius.sm", "6dp", "Badges, chips"],
          ["borderRadius.md", "12dp", "Cards, input fields"],
          ["borderRadius.lg", "20dp", "Bottom sheets, modals"],
          ["borderRadius.full", "9999dp", "Pill buttons, avatars"],
        ],
        [2200, 1400, 5760]
      ),
      divider(),

      h1("5. Component Specifications"),

      h2("5.1 Login Screen"),
      bullet("Background: full-screen #1A1A2E"),
      bullet("ET logo centered, top 30% of screen — gold text or gold-outlined logo"),
      bullet("Tagline below logo: 'Your Orders. Your Way.' in Montserrat 14sp #A0A0A0"),
      bullet("Input fields: rounded (borderRadius 12dp), background #2C2C54, gold bottom border on focus, white text"),
      bullet("'Login' button: full-width, #C8973A background, #1A1A2E text, 48dp height, bold Montserrat"),
      bullet("'Forgot Password?' — small text link below button, #A0A0A0"),
      bullet("No sign-up text, link, or button anywhere on this screen"),

      h2("5.2 Bottom Navigation Bar"),
      bullet("4 tabs: Home, Orders, Track, Profile"),
      bullet("Background: #1A1A2E with subtle top border #C8973A (1dp)"),
      bullet("Active tab: gold icon + gold label"),
      bullet("Inactive tab: gray icon + gray label"),
      bullet("Icons: use react-native-vector-icons (Feather or MaterialCommunityIcons)"),

      h2("5.3 Order Cards"),
      bullet("Background: #2C2C54, border-radius 12dp, 16dp inner padding"),
      bullet("Left accent bar: 3dp vertical strip in status color (green=delivered, amber=in progress, etc.)"),
      bullet("Order number: gold monospace text, top-right"),
      bullet("Product name: white, 16sp SemiBold"),
      bullet("Date: gray, 12sp"),
      bullet("Status badge: pill shape, colored background, white bold text 11sp"),
      bullet("Shadow: subtle elevation (shadowColor: #C8973A, opacity 0.1)"),

      h2("5.4 Order Tracking Timeline"),
      bullet("Vertical stepper layout"),
      bullet("Completed stages: gold filled circle with checkmark, gold connecting line"),
      bullet("Current/active stage: animated pulsing gold circle, #C8973A glow effect"),
      bullet("Future stages: dark gray empty circle, gray dashed connecting line"),
      bullet("Stage name: white 14sp SemiBold"),
      bullet("Stage timestamp (if completed): gray 12sp below stage name"),
      bullet("Stage note (if admin added one): italic gray 12sp"),
      bullet("On realtime update: new stage animates in from the bottom with fade+slide"),

      h2("5.5 Status Badges"),
      simpleTable(
        ["Status", "Background Color", "Text Color", "Usage"],
        [
          ["Delivered", "#27AE60 (20% opacity bg, full opacity border)", "#27AE60", "Completed orders"],
          ["In Progress", "#F39C12 (20% opacity bg)", "#F39C12", "Active production stages"],
          ["Pending", "#A0A0A0 (20% opacity bg)", "#A0A0A0", "Not yet started"],
          ["Dispatched", "#3498DB (20% opacity bg)", "#3498DB", "Shipped / in transit"],
          ["Cancelled", "#E74C3C (20% opacity bg)", "#E74C3C", "Cancelled orders"],
          ["Paid", "#27AE60 (20% opacity bg)", "#27AE60", "Payment complete"],
          ["Overdue", "#E74C3C (20% opacity bg)", "#E74C3C", "Payment overdue"],
        ],
        [2200, 3200, 1600, 2360]
      ),

      h2("5.6 Buttons"),
      bullet("Primary: #C8973A background, #1A1A2E text, 48dp height, bold Montserrat 15sp, radius 12dp"),
      bullet("Secondary: transparent background, #C8973A border (2dp), #C8973A text"),
      bullet("Destructive: #E74C3C background, white text (logout, cancel)"),
      bullet("Disabled: 40% opacity, no press effect"),
      bullet("All buttons: 300ms press animation (scale to 0.97)"),
      divider(),

      h1("6. Screen Layout Wireframes (Text Description)"),

      h2("Login Screen"),
      p("[Top 30%] → Centered logo + brand name in gold"),
      p("[Middle 40%] → Email input → Password input → Login Button → Forgot Password link"),
      p("[Bottom 30%] → Empty / brand tagline"),

      h2("Dashboard / Home"),
      p("[Header] → 'Welcome, [Name]' left + Notification icon right"),
      p("[Stats Row] → 2 cards: Active Orders (count) | Total Orders (count)"),
      p("[Section: Active Orders] → Horizontal scroll or vertical list of order cards"),
      p("[Section: Recent Activity] → Last 3 order updates with timestamps"),

      h2("Order History"),
      p("[Search Bar] → Filter tabs (All / Active / Completed / Cancelled)"),
      p("[List] → Vertically scrollable list of order cards, newest first"),
      p("[Empty State] → Gold icon + 'No orders found' message"),

      h2("Order Detail"),
      p("[Order Header] → Order number (gold) + status badge + date"),
      p("[Products List] → Each item: name, qty, unit price, total"),
      p("[Summary] → Subtotal, currency, payment status"),
      p("[CTA] → 'Track This Order' gold button"),
      p("[History] → Collapsible section of past stage updates"),

      h2("Tracking Screen"),
      p("[Order number + current status badge at top]"),
      p("[Vertical timeline of 11 stages]"),
      p("[Each stage: circle indicator + name + timestamp + optional note]"),
      p("[Live update indicator: pulsing dot if subscription is active]"),

      h2("Profile Screen"),
      p("[Avatar placeholder with initials] → Name + Email"),
      p("[Info Cards] → Company, Phone, Country]"),
      p("[Contact Support button] → opens email"),
      p("[Logout button] → red, at bottom"),
      divider(),

      h1("7. Constants File (React Native)"),
      p("Create this file at /constants/theme.js and import everywhere:"),
      code("export const COLORS = {"),
      code("  primary: '#1A1A2E',"),
      code("  accent: '#C8973A',"),
      code("  surface: '#2C2C54',"),
      code("  cream: '#F9F6EE',"),
      code("  white: '#FFFFFF',"),
      code("  textSecondary: '#A0A0A0',"),
      code("  success: '#27AE60',"),
      code("  error: '#E74C3C',"),
      code("  warning: '#F39C12',"),
      code("  info: '#3498DB',"),
      code("};"),
      p(""),
      code("export const SPACING = {"),
      code("  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,"),
      code("};"),
      p(""),
      code("export const RADIUS = {"),
      code("  sm: 6, md: 12, lg: 20, full: 9999,"),
      code("};"),
      p(""),
      code("export const FONTS = {"),
      code("  heading: 'PlayfairDisplay_700Bold',"),
      code("  body: 'Montserrat_400Regular',"),
      code("  bodyMedium: 'Montserrat_500Medium',"),
      code("  bodySemiBold: 'Montserrat_600SemiBold',"),
      code("  bodyBold: 'Montserrat_700Bold',"),
      code("  mono: 'Courier New',"),
      code("};"),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/mnt/user-data/outputs/03_ET_UI_Design_Guide.docx', buf);
  console.log('Done: 03_ET_UI_Design_Guide.docx');
});
