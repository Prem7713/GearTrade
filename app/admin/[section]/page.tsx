import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface SectionContent {
  title: string;
  description: string;
  headers: string[];
  rows: string[][];
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function AdminDataTable({ content }: { content: SectionContent }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {content.rows.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-slate-500">No records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>{content.headers.map((header) => <th key={header} className="whitespace-nowrap px-4 py-3 font-semibold">{header}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {content.rows.map((row, rowIndex) => (
                <tr key={`${row[0]}-${rowIndex}`} className="align-top hover:bg-slate-50">
                  {row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`} className="max-w-sm px-4 py-3 text-slate-700">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const user = await getCurrentUser();
  const adminRoles = ["SUPER_ADMIN", "ADMIN", "INVENTORY_MANAGER", "ORDER_MANAGER", "SUPPORT_MANAGER", "CONTENT_MANAGER"];
  if (!user || !adminRoles.includes(user.role)) redirect("/admin/login");
  if (section === "inventory") redirect("/admin/products");

  let content: SectionContent;

  switch (section) {
    case "categories": {
      const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { sortOrder: "asc" } });
      content = {
        title: "Categories",
        description: "Product categories and their inventory counts.",
        headers: ["Category", "Slug", "Vehicle", "Status", "Products"],
        rows: categories.map((category) => [category.name, category.slug, category.vehicleType, category.status, String(category._count.products)]),
      };
      break;
    }
    case "vehicles": {
      const brands = await prisma.vehicleBrand.findMany({ include: { models: { orderBy: { name: "asc" } } }, orderBy: { name: "asc" } });
      content = {
        title: "Vehicles & Models",
        description: "Vehicle brands and supported models used for part fitment.",
        headers: ["Brand", "Type", "Models"],
        rows: brands.map((brand) => [brand.name, brand.vehicleType, brand.models.map((model) => model.name).join(", ") || "No models"]),
      };
      break;
    }
    case "reviews": {
      const reviews = await prisma.review.findMany({ include: { customer: { select: { name: true } }, product: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
      content = {
        title: "Customer Reviews",
        description: "Recent product ratings and customer feedback.",
        headers: ["Customer", "Product", "Rating", "Review", "Status", "Date"],
        rows: reviews.map((review) => [review.customer.name, review.product.name, `${review.rating}/5`, review.comment, review.status, formatDate(review.createdAt)]),
      };
      break;
    }
    case "support": {
      const tickets = await prisma.supportTicket.findMany({ include: { customer: { select: { name: true } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" }, take: 100 });
      content = {
        title: "Support Tickets",
        description: "Customer service requests and their latest replies.",
        headers: ["Ticket", "Subject", "Customer", "Priority", "Status", "Updated"],
        rows: tickets.map((ticket) => [ticket.ticketNumber, ticket.subject, ticket.customer.name, ticket.priority, ticket.status, formatDate(ticket.updatedAt)]),
      };
      break;
    }
    case "coupons": {
      const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
      content = {
        title: "Discount Coupons",
        description: "Coupon codes, discount rules, and usage counts.",
        headers: ["Code", "Discount", "Minimum Order", "Usage", "Status", "Expires"],
        rows: coupons.map((coupon) => [coupon.code, `${coupon.discountValue}${coupon.discountType === "PERCENTAGE" ? "%" : "₹"}`, `₹${coupon.minimumOrder.toLocaleString("en-IN")}`, `${coupon.usedCount} / ${coupon.usageLimit}`, coupon.status, coupon.expiryDate ? formatDate(coupon.expiryDate) : "No expiry"]),
      };
      break;
    }
    case "banners": {
      const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
      content = {
        title: "Banners & Homepage",
        description: "Homepage promotional banners and their display order.",
        headers: ["Title", "Subtitle", "Link", "Order", "Status"],
        rows: banners.map((banner) => [banner.title, banner.subtitle || "—", banner.linkUrl || "—", String(banner.sortOrder), banner.active ? "Active" : "Inactive"]),
      };
      break;
    }
    case "analytics": {
      const [orders, paidOrders, products, customers, pendingOffers] = await Promise.all([
        prisma.order.count(),
        prisma.order.findMany({ where: { paymentStatus: "PAID" }, select: { total: true } }),
        prisma.product.count(),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.offer.count({ where: { status: { in: ["PENDING", "COUNTER_OFFER"] } } }),
      ]);
      const sales = paidOrders.reduce((sum, order) => sum + order.total, 0);
      content = {
        title: "Reports & Analytics",
        description: "Current marketplace totals from orders, inventory, customers, and offers.",
        headers: ["Metric", "Value"],
        rows: [["Paid gross sales", `₹${sales.toLocaleString("en-IN")}`], ["Orders", String(orders)], ["Products", String(products)], ["Customers", String(customers)], ["Pending bargains", String(pendingOffers)]],
      };
      break;
    }
    case "audit-logs": {
      const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
      content = {
        title: "Audit Logs",
        description: "Recent administrative changes and actions.",
        headers: ["Action", "Admin", "Entity", "Entity ID", "Date"],
        rows: logs.map((log) => [log.action, log.adminEmail || "Unknown", log.entity, log.entityId || "—", formatDate(log.createdAt)]),
      };
      break;
    }
    case "settings": {
      const settings = await prisma.websiteSetting.findMany({ orderBy: { key: "asc" } });
      content = {
        title: "Website Settings",
        description: "Stored website configuration values.",
        headers: ["Setting", "Value", "Last Updated"],
        rows: settings.map((setting) => [setting.key, setting.value, formatDate(setting.updatedAt)]),
      };
      break;
    }
    default:
      notFound();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{content.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{content.description}</p>
        </div>
        <Link href="/admin" className="text-sm font-semibold text-orange-700 hover:text-orange-800">Back to dashboard</Link>
      </div>
      <AdminDataTable content={content} />
    </div>
  );
}