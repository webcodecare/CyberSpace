"use client";

import { useState, useEffect } from "react";
import type { Dict } from "@/lib/i18n";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/redux/fetchers/settings/settingsApi";

export default function SettingsClient({ t }: { t: Dict }) {
  const { data: settings, isLoading } = useGetSettingsQuery();
  const [updateSettings] = useUpdateSettingsMutation();

  const [showPrices, setShowPrices] = useState(true);
  const [showStock, setShowStock] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setShowPrices(settings.showPrices);
      setShowStock(settings.showStock);
    }
  }, [settings]);

  async function updateSetting(key: string, value: boolean) {
    setSaving(true);
    setSaved(false);
    try {
      await updateSettings({ key, value }).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function handlePrices(v: boolean) {
    setShowPrices(v);
    updateSetting("showPrices", v);
  }

  function handleStock(v: boolean) {
    setShowStock(v);
    updateSetting("showStock", v);
  }

  if (isLoading) {
    return (
      <div className="dash-settings">
        <div className="settings-card">
          <span className="skel skel--md" style={{ width: 160, height: 20 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="dash-settings">
      <div className="settings-card">
        <h2 className="settings-card__title">{t.dash.visibilitySettings}</h2>
        <p className="settings-card__note">{t.admin.hiddenNote}</p>

        <div className="settings-row">
          <div className="settings-row__info">
            <p className="settings-row__label">{t.dash.showPrices}</p>
          </div>
          <button
            type="button"
            className={`toggle-switch ${showPrices ? "toggle-switch--on" : ""}`}
            disabled={saving}
            onClick={() => handlePrices(!showPrices)}
            aria-pressed={showPrices}
            aria-label={t.dash.showPrices}
          >
            <span className="toggle-switch__knob" />
          </button>
        </div>

        <div className="settings-row">
          <div className="settings-row__info">
            <p className="settings-row__label">{t.dash.showStock}</p>
          </div>
          <button
            type="button"
            className={`toggle-switch ${showStock ? "toggle-switch--on" : ""}`}
            disabled={saving}
            onClick={() => handleStock(!showStock)}
            aria-pressed={showStock}
            aria-label={t.dash.showStock}
          >
            <span className="toggle-switch__knob" />
          </button>
        </div>

        {saved && <p className="settings-saved">{t.dash.saved}</p>}
      </div>
    </div>
  );
}
