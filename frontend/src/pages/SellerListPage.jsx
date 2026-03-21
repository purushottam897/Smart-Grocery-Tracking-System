import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AddSellerForm from "../components/AddSellerForm";
import api from "../api";

const PREVIEW_COUNT = 6;

function SellerListPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchSellers = async (searchTerm = "") => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/sellers", {
        params: searchTerm ? { search: searchTerm } : {}
      });
      setSellers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load sellers", err);
      setSellers([]);
      setError("Unable to load sellers. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchSellers(search);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const handleSellerAdded = async (payload) => {
    try {
      setError("");
      await api.post("/add-seller", payload);
      setMessage(t("messages.sellerSaved"));
      fetchSellers(search);
    } catch (err) {
      console.error("Failed to add seller", err);
      setError("Unable to save seller. Please try again.");
    }
  };

  return (
    <div className="page-grid">
      <section className="page-header">
        <h2>{t("pages.sellerListTitle")}</h2>
        <p>{t("pages.sellerListSubtitle")}</p>
      </section>

      {message ? <p className="success-message">{message}</p> : null}
      {error ? <p className="empty-state">{error}</p> : null}

      <div className="split-layout">
        <AddSellerForm onSellerAdded={handleSellerAdded} />

        <section className="card">
          <div className="title-row">
            <div>
              <h2>{t("pages.farmerPreviewTitle")}</h2>
              <p className="section-copy">{t("pages.farmerPreviewSubtitle")}</p>
            </div>
            <Link className="secondary-button inline-button" to="/farmers">
              {t("actions.viewAllFarmers")}
            </Link>
          </div>

          <p className="helper-text">{t("voice.teluguHint")}</p>

          {loading ? (
            <p>{t("actions.loading")}</p>
          ) : sellers.length === 0 ? (
            <p className="empty-state">{t("messages.noSellers")}</p>
          ) : (
            <div className="seller-list">
              {sellers.slice(0, PREVIEW_COUNT).map((seller) => (
                <Link key={seller.id} to={`/seller/${seller.id}`} className="seller-card">
                  <div>
                    <h3>{seller.person_name}</h3>
                    <p>{seller.product}</p>
                    <p>{seller.village}</p>
                  </div>
                  <div className="seller-total">
                    <span>{t("entry.dailyTotal")}</span>
                    <strong>{Number(seller.today_total_kg || 0).toFixed(2)} kg</strong>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && sellers.length > PREVIEW_COUNT ? (
            <Link className="text-link" to="/farmers">
              {t("messages.moreFarmers", { count: sellers.length - PREVIEW_COUNT })}
            </Link>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default SellerListPage;
