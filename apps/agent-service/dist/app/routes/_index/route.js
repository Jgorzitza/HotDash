import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";
export const meta = () => {
    return [
        { title: "Hot Dash - Shopify Control Center | Real-time Analytics & Inventory Management" },
        { name: "description", content: "Centralized control center for Shopify stores. Real-time analytics, inventory management, customer experience, and growth automation in one dashboard." },
        { name: "keywords", content: "shopify analytics, inventory management, shopify dashboard, ecommerce analytics, shopify control center" },
        { property: "og:title", content: "Hot Dash - Shopify Control Center" },
        { property: "og:description", content: "Centralized control center for Shopify stores with real-time analytics and automation." },
        { property: "og:type", content: "website" },
        { property: "og:image", content: "/og-image.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Hot Dash - Shopify Control Center" },
        { name: "twitter:description", content: "Real-time analytics and inventory management for Shopify stores." },
        { name: "twitter:image", content: "/og-image.png" },
    ];
};
export const loader = async ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get("shop")) {
        throw redirect(`/app?${url.searchParams.toString()}`);
    }
    return { showForm: Boolean(login) };
};
export default function App() {
    const { showForm } = useLoaderData();
    return (<div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Hot Dash - Your Shopify Control Center</h1>
        <p className={styles.text}>
          Centralized metrics, inventory control, customer experience, and growth automation for Shopify stores.
        </p>
        {showForm && (<Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop"/>
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>)}
        <ul className={styles.list}>
          <li>
            <strong>Real-time Analytics</strong>. Monitor sales, traffic, and performance metrics in real-time with actionable insights.
          </li>
          <li>
            <strong>Inventory Management</strong>. Automated stock alerts, reorder suggestions, and inventory optimization powered by AI.
          </li>
          <li>
            <strong>Growth Automation</strong>. SEO optimization, content generation, and marketing automation to scale your store.
          </li>
        </ul>
      </div>
    </div>);
}
//# sourceMappingURL=route.js.map