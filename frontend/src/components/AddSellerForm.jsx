import { useState } from "react";
import { useTranslation } from "react-i18next";

import VoiceInputButton from "./VoiceInputButton";

const productOptions = ["ధాన్యం", "మొక్కజొన్న"];

const initialState = {
  person_name: "",
  product: "",
  village: ""
};

function AddSellerForm({ onSellerAdded }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleVoiceFill = (fieldName) => (transcript) => {
    setFormData((current) => ({ ...current, [fieldName]: transcript }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    await onSellerAdded(formData);
    setFormData(initialState);
    setProductMenuOpen(false);
    setSubmitting(false);
  };

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <h2>{t("actions.addSeller")}</h2>

      <label>
        <span>{t("labels.personName")}</span>
        <div className="voice-input-row">
          <input
            required
            name="person_name"
            value={formData.person_name}
            onChange={handleChange}
            placeholder={t("placeholders.personName")}
          />
          <VoiceInputButton onTranscript={handleVoiceFill("person_name")} lang="te-IN" />
        </div>
      </label>

      <label>
        <span>{t("labels.product")}</span>
        <div className="product-picker">
          <button
            type="button"
            className={`product-picker-button${productMenuOpen ? " open" : ""}`}
            onClick={() => setProductMenuOpen((current) => !current)}
          >
            <span>{formData.product || t("placeholders.product")}</span>
            <span>{productMenuOpen ? "▲" : "▼"}</span>
          </button>

          {productMenuOpen ? (
            <div className="product-picker-menu" role="listbox" aria-label={t("labels.product")}>
              {productOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`product-option${formData.product === option ? " active" : ""}`}
                  onClick={() => {
                    setFormData((current) => ({ ...current, product: option }));
                    setProductMenuOpen(false);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}

          <input required type="hidden" name="product" value={formData.product} onChange={handleChange} />
        </div>
      </label>

      <label>
        <span>{t("labels.village")}</span>
        <div className="voice-input-row">
          <input
            required
            name="village"
            value={formData.village}
            onChange={handleChange}
            placeholder={t("placeholders.village")}
          />
          <VoiceInputButton onTranscript={handleVoiceFill("village")} lang="te-IN" />
        </div>
      </label>

      <button type="submit" className="primary-button" disabled={submitting}>
        {submitting ? t("actions.loading") : t("actions.addSeller")}
      </button>
    </form>
  );
}

export default AddSellerForm;
