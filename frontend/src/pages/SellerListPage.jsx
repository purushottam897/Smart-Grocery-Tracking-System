import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AddSellerForm from "../components/AddSellerForm";
import VoiceInputButton from "../components/VoiceInputButton";
import api from "../api";

function SellerListPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchSellers = async (searchTerm = "") => {
    setLoading(true);
    const response = await api.get("/sellers", {
      params: searchTerm ? { search: searchTerm } : {}
    });
    setSellers(response.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleSellerAdded = async (payload) => {
    await api.post("/add-seller", payload);
    setMessage(t("messages.sellerSaved"));
    fetchSellers(search);
  };

  const handleSearch = async (event) => {
    const value = event.target.value;
    setSearch(value);
    fetchSellers(value);
  };

  return (
    <div className="page-grid">
      <section className="page-header">
        <h2>{t("pages.sellerListTitle")}</h2>
        <p>{t("pages.sellerListSubtitle")}</p>
      </section>

      {message ? <p className="success-message">{message}</p> : null}

      <div className="split-layout">
        <AddSellerForm onSellerAdded={handleSellerAdded} />

        <section className="card">
          <div className="title-row">
            <h2>{t("nav.sellers")}</h2>
          </div>

          <input
            className="search-input"
            value={search}
            onChange={handleSearch}
            placeholder={t("placeholders.searchSeller")}
          />
          <div className="search-voice-row">
            <VoiceInputButton
              onTranscript={(transcript) => {
                setSearch(transcript);
                fetchSellers(transcript);
              }}
            />
          </div>

          {loading ? (
            <p>{t("actions.loading")}</p>
          ) : sellers.length === 0 ? (
            <p className="empty-state">{t("messages.noSellers")}</p>
          ) : (
            <div className="seller-list">
              {sellers.map((seller) => (
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
        </section>
      </div>
    </div>
  );
}

export default SellerListPage;
