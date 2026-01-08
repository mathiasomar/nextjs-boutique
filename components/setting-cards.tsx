"use client";

import SettingCard from "./setting-card";

const SettingCards = () => {
  return (
    <div className="w-full py-4 space-y-10">
      <SettingCard category="branding" />
      <SettingCard category="general" />
      <SettingCard category="payments" />
      <SettingCard category="database" />
      <SettingCard category="other" />
    </div>
  );
};

export default SettingCards;
