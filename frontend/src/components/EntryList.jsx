import { useTranslation } from "react-i18next";

function EntryList({ entries, dailyTotal }) {
  const { t } = useTranslation();

  return (
    <section className="card">
      <div className="title-row">
        <h2>{t("pages.entriesTitle")}</h2>
        <div className="pill">
          {t("entry.dailyTotal")}: <strong>{Number(dailyTotal || 0).toFixed(2)} kg</strong>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="empty-state">{t("messages.noEntries")}</p>
      ) : (
        <div className="entry-list">
          {entries.map((entry) => (
            <div key={entry.id} className="entry-item">
              <div>
                <strong>
                  {t("entry.calculation", {
                    bags: entry.bags,
                    weight: entry.weight_per_bag,
                    total: Number(entry.total_kg).toFixed(2)
                  })}
                </strong>
                <p>{new Date(entry.date).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default EntryList;
