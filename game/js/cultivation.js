// ===== 修炼系统 =====

class CultivationSystem {
  constructor(game) {
    this.game = game;
  }

  render() {
    const info = document.getElementById('cultivation-info');
    const actions = document.getElementById('cultivation-actions');
    const p = this.game.player;
    const s = p.stats;

    info.innerHTML = `
      <p>🧘 <strong>${p.realm.display}</strong></p>
      <p>经验：${s.exp} / ${s.expToNext}</p>
      <div class="bar-track" style="width:100%;height:14px;margin:0.5rem 0">
        <div class="bar-fill" style="width:${(s.exp/s.expToNext)*100}%;background:var(--accent-purple)"></div>
      </div>
      <p style="color:var(--text-dim);font-size:0.85rem">
        攻击：${s.attack} | 防御：${s.defense} | 速度：${s.speed}<br>
        血量上限：${s.maxHp} | 灵力上限：${s.maxSp}
      </p>
      <hr style="border-color:var(--border-ink);margin:1rem 0">
      <p><strong>已学功法：</strong></p>
    `;

    const skillsData = window.SkillsData || {};
    p.skills.forEach(sid => {
      const sk = skillsData[sid];
      if (sk) {
        info.innerHTML += `<p style="color:var(--accent-blue)">• ${sk.name} — ${sk.description || ''}</p>`;
      }
    });

    actions.innerHTML = '';

    // 打坐修炼
    const meditateBtn = document.createElement('button');
    meditateBtn.className = 'btn-ink';
    meditateBtn.textContent = '🧘 打坐修炼 (恢复灵力 + 获得经验)';
    meditateBtn.onclick = () => this.meditate();
    actions.appendChild(meditateBtn);

    // 恢复血量
    const restBtn = document.createElement('button');
    restBtn.className = 'btn-ink';
    restBtn.textContent = '💤 休息 (恢复血量)';
    restBtn.onclick = () => this.rest();
    actions.appendChild(restBtn);
  }

  meditate() {
    const s = this.game.player.stats;
    const expGain = 10 + Math.floor(Math.random() * 10);
    const spGain = Math.floor(s.maxSp * 0.3);
    s.sp = Math.min(s.maxSp, s.sp + spGain);
    this.game.modifyStat('exp', expGain);
    this.game.renderer.updateHUD();
    this.render();

    this.game.renderer.renderSystemPopup('修炼结果', [
      { text: `【灵力恢复 +${spGain}】`, style: 'sp' },
      { text: `【经验获得 +${expGain}】`, style: 'buff' },
      { text: `【系统：又水了一波经验，不错不错。】`, style: 'snark' }
    ], () => {
      this.game.switchScene('cultivation');
      this.render();
    });
  }

  rest() {
    const s = this.game.player.stats;
    const hpGain = Math.floor(s.maxHp * 0.5);
    s.hp = Math.min(s.maxHp, s.hp + hpGain);
    this.game.renderer.updateHUD();
    this.render();

    this.game.renderer.renderSystemPopup('休息结果', [
      { text: `【血量恢复 +${hpGain}】`, style: 'hp' },
      { text: `【系统：睡一觉就满血，这游戏也太简单了。】`, style: 'snark' }
    ], () => {
      this.game.switchScene('cultivation');
      this.render();
    });
  }
}
