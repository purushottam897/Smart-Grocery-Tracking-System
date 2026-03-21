import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import VoiceInputButton from "../components/VoiceInputButton";
import api from "../api";

const PAGE_SIZE = 8;

function FarmerDirectoryPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/sellers", {
          params: search ? { search } : {}
        });
        setSellers(Array.isArray(response.data) ? response.data : []);
        setPage(1);
      } catch (err) {
        console.error("Failed to load sellers", err);
        setSellers([]);
        setError("Unable to load sellers. Please check the backend connection.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(sellers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const visibleSellers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sellers.slice(start, start + PAGE_SIZE);
  }, [currentPage, sellers]);

  return (
    <div className="page-grid">
      <section className="page-header">
        <h2>{t("pages.farmerDirectoryTitle")}</h2>
        <p>{t("pages.farmerDirectorySubtitle")}</p>
      </section>

      {error ? <p className="empty-state">{error}</p> : null}

      <section className="card">
        <div className="title-row">
          <h2>{t("nav.sellers")}</h2>
          <Link className="secondary-button inline-button" to="/">
            {t("nav.profile")}
          </Link>
        </div>

        <input
          className="search-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("placeholders.searchSeller")}
        />
        <div className="search-voice-row">
          <VoiceInputButton onTranscript={setSearch} />
        </div>

        {loading ? (
          <p>{t("actions.loading")}</p>
        ) : visibleSellers.length === 0 ? (
          <p className="empty-state">{t("messages.noSellers")}</p>
        ) : (
          <>
            <div className="seller-list">
              {visibleSellers.map((seller) => (
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

            <div className="pagination-row">
              <button
                type="button"
                className="secondary-button"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                {t("pagination.previous")}
              </button>
              <span className="pill">{t("pagination.pageStatus", { page: currentPage, total: totalPages })}</span>
              <button
                type="button"
                className="secondary-button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                {t("pagination.next")}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default FarmerDirectoryPage;
