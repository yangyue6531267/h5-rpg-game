// ===== 境界系统 =====

export const REALMS = [
  { name: '炼气', levels: 9, hpBase: 100, spBase: 50, atkBase: 12, defBase: 5 },
  { name: '筑基', levels: 9, hpBase: 500, spBase: 200, atkBase: 50, defBase: 25 }
];

const CHINESE_NUMS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

export function getRealmDisplay(realm) {
  return realm.name + CHINESE_NUMS[realm.level] + '层';
}

export function checkLevelUp(player, events) {
  const s = player.stats;
  while (s.exp >= s.expToNext) {
    s.exp -= s.expToNext;
    const r = player.realm;
    r.level++;

    if (r.level > 9) {
      const idx = REALMS.findIndex(rm => rm.name === r.name);
      if (idx < REALMS.length - 1) {
        const next = REALMS[idx + 1];
        r.name = next.name;
        r.level = 1;
        s.maxHp = next.hpBase;
        s.maxSp = next.spBase;
        s.attack = next.atkBase;
        s.defense = next.defBase;
      } else {
        r.level = 9;
        s.exp = 0;
      }
    } else {
      const realmData = REALMS.find(rm => rm.name === r.name);
      const ratio = r.level / 9;
      const nextRealm = REALMS[REALMS.indexOf(realmData) + 1] || realmData;
      s.maxHp = Math.floor(realmData.hpBase + (nextRealm.hpBase - realmData.hpBase) * ratio);
      s.maxSp = Math.floor(realmData.spBase + (nextRealm.spBase - realmData.spBase) * ratio);
      s.attack = Math.floor(realmData.atkBase + (nextRealm.atkBase - realmData.atkBase) * ratio);
      s.defense = Math.floor(realmData.defBase + (nextRealm.defBase - realmData.defBase) * ratio);
    }

    s.hp = s.maxHp;
    s.sp = s.maxSp;
    s.expToNext = Math.floor(s.expToNext * 1.5);
    r.display = getRealmDisplay(r);

    if (events) {
      events.emit('levelUp', r);
    }
  }
}
