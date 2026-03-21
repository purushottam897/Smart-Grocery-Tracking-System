import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const initialEntry = {
  bags: "",
  weight_per_bag: ""
};

function EntryForm({ lastEntry, onSubmitEntry, onRepeatLastEntry }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialEntry);
  const total = Number(formData.weight_per_bag || 0);

  useEffect(() => {
    if (lastEntry) {
      setFormData({
        bags: String(lastEntry.bags ?? ""),
        weight_per_bag: String(lastEntry.weight_per_bag ?? "")
      });
    }
  }, [lastEntry]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmitEntry(formData);
    setFormData(initialEntry);
  };

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <div className="title-row">
        <h2>{t("actions.addEntry")}</h2>
        <button
          type="button"
          className="secondary-button"
          onClick={onRepeatLastEntry}
          disabled={!lastEntry}
        >
          {t("actions.repeatLastEntry")}
        </button>
      </div>

      <label>
        <span>{t("labels.bags")}</span>
        <input
          type="number"
          min="1"
          step="1"
          required
          name="bags"
          value={formData.bags}
          onChange={handleChange}
          placeholder={t("placeholders.bags")}
        />
      </label>

      <label>
        <span>{t("labels.weightPerBag")}</span>
        <input
          type="number"
          min="0.01"
          step="0.01"
          required
          name="weight_per_bag"
          value={formData.weight_per_bag}
          onChange={handleChange}
          placeholder={t("placeholders.weightPerBag")}
        />
      </label>

      <div className="summary-box">
        <span>{t("labels.totalKg")}</span>
        <strong>{total.toFixed(2)} kg</strong>
      </div>

      <button type="submit" className="primary-button">
        {t("actions.addEntry")}
      </button>
    </form>
  );
}

export default EntryForm;
