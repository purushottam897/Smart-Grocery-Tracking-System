import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import api from "../api";
import EntryForm from "../components/EntryForm";
import EntryList from "../components/EntryList";

function SellerDetailPage() {
  const { sellerId } = useParams();
  const { t } = useTranslation();
  const [seller, setSeller] = useState(null);
  const [entries, setEntries] = useState([]);
  const [lastEntry, setLastEntry] = useState(null);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      setError("");
      const [sellerResponse, entriesResponse] = await Promise.all([
        api.get(`/sellers/${sellerId}`),
        api.get(`/entries/${sellerId}`)
      ]);

      setSeller(sellerResponse.data || null);
      setEntries(Array.isArray(entriesResponse.data?.entries) ? entriesResponse.data.entries : []);
      setLastEntry(entriesResponse.data?.last_entry || null);
      setDailyTotal(entriesResponse.data?.today_total_kg || 0);
    } catch (err) {
      console.error("Failed to load seller details", err);
      setSeller(null);
      setEntries([]);
      setLastEntry(null);
      setDailyTotal(0);
      setError("Unable to load seller details. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, [sellerId]);

  const handleSubmitEntry = async (payload) => {
    try {
      setError("");
      await api.post("/add-entry", {
        seller_id: Number(sellerId),
        bags: Number(payload.bags),
        weight_per_bag: Number(payload.weight_per_bag)
      });
      setMessage(t("messages.entrySaved"));
      fetchSellerData();
    } catch (err) {
      console.error("Failed to save entry", err);
      setError("Unable to save entry. Please try again.");
    }
  };

  const handleRepeatLastEntry = async () => {
    if (!lastEntry) {
      return;
    }
    try {
      setError("");
      await api.post("/add-entry", {
        seller_id: Number(sellerId),
        bags: Number(lastEntry.bags),
        weight_per_bag: Number(lastEntry.weight_per_bag)
      });
      setMessage(t("messages.entryRepeated"));
      fetchSellerData();
    } catch (err) {
      console.error("Failed to repeat entry", err);
      setError("Unable to repeat the last entry. Please try again.");
    }
  };

  if (loading) {
    return <p>{t("actions.loading")}</p>;
  }

  if (error) {
    return <p className="empty-state">{error}</p>;
  }

  if (!seller) {
    return <p className="empty-state">Seller not found.</p>;
  }

  return (
    <div className="page-grid">
      <Link className="back-link" to="/">
        ← {t("nav.sellers")}
      </Link>

      {message ? <p className="success-message">{message}</p> : null}
      {error ? <p className="empty-state">{error}</p> : null}

      <section className="card seller-detail-card">
        <div>
          <p className="eyebrow">{t("pages.sellerDetailTitle")}</p>
          <h2>{seller.person_name}</h2>
        </div>
        <div className="detail-grid">
          <div>
            <span>{t("labels.product")}</span>
            <strong>{seller.product}</strong>
          </div>
          <div>
            <span>{t("labels.village")}</span>
            <strong>{seller.village}</strong>
          </div>
          <div>
            <span>{t("entry.dailyTotal")}</span>
            <strong>{Number(dailyTotal).toFixed(2)} kg</strong>
          </div>
        </div>
      </section>

      <div className="split-layout">
        <EntryForm
          lastEntry={lastEntry}
          onSubmitEntry={handleSubmitEntry}
          onRepeatLastEntry={handleRepeatLastEntry}
        />
        <EntryList entries={entries} dailyTotal={dailyTotal} />
      </div>
    </div>
  );
}

export default SellerDetailPage;
