import { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import { useTranslation } from "react-i18next";

import api from "../api";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function DashboardPage() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("today");
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  const fetchDashboard = async (selectedPeriod) => {
    try {
      setError("");
      const response = await api.get("/dashboard", {
        params: { period: selectedPeriod }
      });
      setDashboard(response.data || {});
    } catch (err) {
      console.error("Failed to load dashboard", err);
      setDashboard({
        total_purchased_kg: 0,
        top_seller: null,
        village_totals: [],
        chart_data: []
      });
      setError("Unable to load dashboard. Please check the backend connection.");
    }
  };

  useEffect(() => {
    fetchDashboard(period);
  }, [period]);

  const chartData = useMemo(() => {
    const labels = dashboard?.chart_data?.map((item) => item.person_name) || [];
    const values = dashboard?.chart_data?.map((item) => Number(item.total_kg)) || [];

    return {
      labels,
      datasets: [
        {
          label: t("labels.totalKg"),
          data: values,
          backgroundColor: "#3c7a5d",
          borderRadius: 10
        }
      ]
    };
  }, [dashboard, t]);

  return (
    <div className="page-grid">
      <section className="page-header">
        <h2>{t("pages.dashboardTitle")}</h2>
        <p>{t("pages.dashboardSubtitle")}</p>
      </section>

      <section className="dashboard-filter-row">
        <span>{t("labels.period")}</span>
        <div className="filter-pills">
          {["today", "week", "month"].map((key) => (
            <button
              key={key}
              type="button"
              className={period === key ? "active" : ""}
              onClick={() => setPeriod(key)}
            >
              {t(`labels.${key}`)}
            </button>
          ))}
        </div>
      </section>

      {!dashboard ? (
        <p>{t("actions.loading")}</p>
      ) : (
        <>
          {error ? <p className="empty-state">{error}</p> : null}
          <div className="stats-grid">
            <article className="stat-card">
              <span>{t("dashboard.totalPurchasedToday")}</span>
              <strong>{Number(dashboard.total_purchased_kg).toFixed(2)} kg</strong>
            </article>

            <article className="stat-card">
              <span>{t("dashboard.topSeller")}</span>
              <strong>
                {dashboard.top_seller
                  ? `${dashboard.top_seller.person_name} (${Number(dashboard.top_seller.total_kg).toFixed(2)} kg)`
                  : t("messages.topSellerNone")}
              </strong>
            </article>
          </div>

          <div className="split-layout">
            <section className="card">
              <h2>{t("dashboard.villageTotals")}</h2>
              {(dashboard.village_totals || []).length === 0 ? (
                <p className="empty-state">{t("messages.dashboardEmpty")}</p>
              ) : (
                <div className="village-list">
                  {(dashboard.village_totals || []).map((item) => (
                    <div key={item.village} className="village-item">
                      <span>{item.village}</span>
                      <strong>{Number(item.total_kg).toFixed(2)} kg</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="card chart-card">
              <h2>{t("dashboard.chartTitle")}</h2>
              {(dashboard.chart_data || []).length === 0 ? (
                <p className="empty-state">{t("messages.dashboardEmpty")}</p>
              ) : (
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false }
                    }
                  }}
                />
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
