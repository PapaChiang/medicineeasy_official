const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelSecret: '207c9cacbb331a407abae2c87674763a',
  channelAccessToken: 'Xkkn77tGqhOP6+l3AUVw9ZYyCI3Ei/d6UP5PfAF0A0ySHvxnDHTCiQU+t63rsPB3CVlXJkTLozz1rNXYruZoyxKSbQIsm13JZ0uicZTGM0qm4NR5vc7UeDGOEDFSy+iVTpJuhWCPm9FyVjqygvadRQdB04t89/1O/w1cDnyilFU='
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken
});

const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.status(200).end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// 每個藥品的 Quick Reply 選項
function makeQuickReply(prefix) {
  return {
    items: [
      { type: 'action', action: { type: 'message', label: '用藥前準備（含藥品組裝）', text: `${prefix}｜用藥前準備` } },
      { type: 'action', action: { type: 'message', label: '如何用藥', text: `${prefix}｜如何用藥` } },
      { type: 'action', action: { type: 'message', label: '如何清潔與保存', text: `${prefix}｜如何清潔與保存` } },
      { type: 'action', action: { type: 'message', label: '如何妥善丟棄', text: `${prefix}｜如何妥善丟棄` } },
      { type: 'action', action: { type: 'message', label: '注意事項', text: `${prefix}｜注意事項` } }
    ]
  };
}

// 各藥品資料
const medicines = {
  '了解「吸必擴氣化噴霧劑」': {
    prefix: '吸必擴',
    replies: {
      '用藥前準備': `吸必擴用藥前，需要輕輕搖晃吸入器5秒，並直立對空按壓1次，之後再輕輕搖晃它5秒，並再次對空按壓1次準備使用。`,
      '如何用藥': `1. 每次使用前輕輕搖晃吸入器5秒。
2. 移開吸嘴蓋，確保吸嘴處無異物。
3. 將吸入器直立在嘴巴前方，拇指放在底部，食指放在頂部。
4. 盡力呼氣，輕輕放入口中牙齒之間，並閉上嘴唇包覆吸嘴。
5. 緩慢地用力深深吸氣，同時確實按壓吸入器。
6. 繼續吸氣，並閉氣約10秒，或直到感覺不舒服為止。
7. 放開食指，保持吸入器直立，從口中移出。
8. 如需吸入第二劑，輕輕搖動5秒，重複步驟3-7。
9. 蓋上吸嘴蓋。
10. 以水漱口，去除多餘的藥物。`,
      '如何清潔與保存': `仿單中未記載清潔與保存的詳細說明。請定期（至少每週一次）用乾淨的乾布擦拭吸入器的吸嘴。`,
      '如何妥善丟棄': `仿單中未記載此資訊。`,
      '注意事項': `1. 吸入後請以水漱口，以減低發生鵝口瘡的風險。
2. 吸入器是新的、超過一週未使用、或曾掉落過時，應對空按壓兩次。
3. 計數器達到0時，應丟棄吸入器。
4. 建議以逐漸降低劑量的方式停藥，不可突然停藥。
5. 氣喘或COPD症狀突然或逐漸惡化時，應立即就醫診治。
6. 應隨時備妥速效型支氣管擴張劑作為急性緩解藥物。`
    }
  },
  '了解「適喘樂舒沛噴吸入劑」': {
    prefix: '適喘樂',
    replies: {
      '用藥前準備': `初次使用步驟：
1. 仔細閱讀傳單上的所有資訊。
2. 從乾燥箔袋取出吸入器，丟棄箔袋。
3. 輕輕搖晃吸入器5秒，直立對空按壓1次，再搖晃5秒，再按壓1次。

每日使用：
・轉動透明底座直到聽到咔嗒聲（半圈）。
・若超過7天未使用，先朝向地面噴1次。
・若超過21天未使用，依初次使用步驟操作直到出現霧狀，再重複3次。

注意：從初次使用算起最多只能用3個月，即使藥液未用完也應丟棄。`,
      '如何用藥': `・每日一次，每次定時按二次噴藥。
・治療氣喘時，須使用數個劑量後才會顯現完整治療效益。
・適用於6歲及以上，已接受吸入性皮質類固醇合併其他控制型藥物仍未控制症狀的嚴重持續性氣喘病人。`,
      '如何清潔與保存': `【清潔】
用濕布或濕紙巾清潔口含器及口含器內的金屬部份，每週至少擦拭一次。口含器如出現輕微褪色，不會影響吸入器功能。

【保存】
・請勿冷凍！
・請存放於兒童伸手不及處！
・請存放於30°C以下！`,
      '如何妥善丟棄': `仿單中未記載此資訊。`,
      '注意事項': `1. 年老者可依推薦劑量使用。
2. 腎功能受損病人使用時需嚴密監控病情。
3. 不建議與其他含抗膽鹼性藥物長期併用。
4. 高劑量可能導致抗膽鹼性徵兆及症狀發生。
5. 副作用包括：暈眩、失眠、青光眼、眼球內壓上升、視力模糊、心房顫動、口乾、便秘等。`
    }
  },
  '了解「耳多贊邦點耳液劑」': {
    prefix: '耳多贊邦',
    replies: {
      '用藥前準備': `耳多贊邦須由醫師處方使用。使用前應審慎確認病人未有鼓膜穿孔的情形。

・成人：一次滴於耳孔內4～5滴，一日2～4次。
・小孩：一次滴於耳孔內2～3滴，一日3～4次。`,
      '如何用藥': `・成人：一次滴於耳孔內4～5滴，一日2～4次。
・小孩：一次滴於耳孔內2～3滴，一日3～4次。`,
      '如何清潔與保存': `・保存：25°C以下避光儲存。
・仿單中未記載清潔方式。`,
      '如何妥善丟棄': `仿單中未記載此資訊。`,
      '注意事項': `1. 長期使用抗生素可能導致抗藥性菌種過度繁殖。
2. 鼓膜有穿孔或已有長期中耳炎病人須慎重使用。
3. 不要持續使用超過10日。
4. 與Kanamycin、Streptomycin及Gentamycin合用時可能引起過敏。
5. 本產品含aminoglycoside類成分，鼓膜穿孔時使用可能增加聽力損害風險。
6. 粒線體基因突變病人（尤其是m.1555A>G突變）需特別注意耳毒性風險。`
    }
  },
  '了解「昂帝博吸入膠囊」': {
    prefix: '昂帝博',
    replies: {
      '用藥前準備': `仿單中未記載用藥前準備的詳細說明。`,
      '如何用藥': `・建議劑量：一次一粒膠囊，使用Ultibro Breezhaler吸入器每天吸一次。
・建議在每日相同的時間使用。
・若錯過一次劑量，應儘速在同一天內用藥。
・一天不可使用超過一個劑量。
・僅可吸入使用，膠囊不可吞服。
・膠囊只可使用Ultibro Breezhaler吸入器給藥。`,
      '如何清潔與保存': `・膠囊應存放在鋁箔片中以防潮，只有在使用前才取出。
・吸入器使用30天後要丟棄。`,
      '如何妥善丟棄': `仿單中未記載此資訊。每次新的處方均須附加一個吸入器，吸入器使用30天後應丟棄。`,
      '注意事項': `1. 不應與含有同類別的長效beta-腎上腺素受體作用劑或長效蕈毒鹼受體拮抗劑的藥品併用。
2. 不可用來治療氣喘。
3. 非用於氣管痙攣急性症狀發生時的治療。
4. 需謹慎使用於隅角性青光眼或尿滯留病人。
5. 應謹慎使用於患有心血管疾病的病人。
6. 18歲以下兒童不應使用。
7. 發生頭暈時可能影響駕駛和操作機械的能力。`
    }
  },
  '了解「維蒂斯眼用凝膠」': {
    prefix: '維蒂斯',
    replies: {
      '用藥前準備': `維蒂斯眼用凝膠須由醫師處方使用。使用時隱形眼鏡需取下。`,
      '如何用藥': `・依照病情輕重，每天及睡前約使用3–5次，若有需要可增加使用次數。
・每次一滴點於結膜囊內。
・使用時隱形眼鏡需取下。`,
      '如何清潔與保存': `・貯存溫度不宜超過25°C。
・置於兒童伸手不及之處。
・開啟後一個月未用完應丟棄。`,
      '如何妥善丟棄': `仿單中未記載此資訊。開啟後一個月未用完應丟棄。`,
      '注意事項': `1. 開啟後一個月未用完應丟棄。
2. 貯存溫度不宜超過25°C。
3. 置於兒童伸手不及之處。
4. 使用後可能有暫時性視線模糊，開車和操作機器時使用宜注意。`
    }
  },
  '了解「美血樂針筒裝注射劑」': {
    prefix: '美血樂',
    replies: {
      '用藥前準備': `美血樂用藥前準備（含藥品組裝）依據仿單內容如下：

1. 讓針筒調整至室溫：請從冰箱小心取出裝有Mircera針筒裝注射劑的盒子。將針筒及針頭放置在盒內，避免陽光照射，並使其回溫至室溫至少30分鐘。
2. 打開盒子，取出塑膠包裝：將保護膜撕下，取出針頭和針筒，在不接觸保護啟動裝置的情況下，手握針筒筒身的中段。
3. 將針頭安裝到針筒上：握牢筒身中段，緊握橡膠頂蓋取下，將針頭緊推到針筒並稍微扭轉固定。
4. 取下針頭套：用一隻手抓牢筒身中段，另一隻手將針頭套直接拉離，丟棄至尖銳物品保存盒中。
5. 選擇建議注射部位，如上臂、大腿或腹部。

注意事項：
・針頭易碎，請小心操作。
・請勿觸摸保護啟動裝置，否則可能損壞針筒。
・若針筒內容物呈現渾濁、霧狀或含有顆粒，請勿使用。`,
      '如何用藥': `美血樂針筒裝注射劑有以下劑量可供選擇：30微公克/0.3毫升、50微公克/0.3毫升、75微公克/0.3毫升、100微公克/0.3毫升、以及120微公克/0.3毫升。

通常，病人會依照醫囑，每兩週或每四週皮下或靜脈注射一劑。醫師會根據病人的情況調整劑量。`,
      '如何清潔與保存': `【清潔】
・針筒及針頭使用前，請用酒精棉片清潔注射部位。
・切勿觸摸保護啟動裝置，否則可能會損壞針筒。
・注射後，請用乾淨的棉球或紗布覆蓋注射部位並按壓幾秒鐘。
・切勿重複使用或重複消毒針筒或針頭。

【保存】
・預先充填針筒、針頭和防穿刺保存盒應放置於孩童無法取得之處。
・針筒及針頭儲存於原始包裝中，直到準備使用。
・應儲存在溫度為2～8°C的冰箱中。
・請勿冷凍藥物，並避免受到光照。
・請保持針筒及針頭乾燥。`,
      '如何妥善丟棄': `・請將使用過的針筒丟棄至防尖銳物品／穿刺的保存盒中。
・請丟棄整個防尖銳物品／穿刺的保存盒。
・請勿試圖更換針頭上的針頭套。
・請勿將使用過的針頭及針筒丟棄在家庭垃圾中，應依據衛生主管機構政策丟棄至防尖銳物品保存盒中。
・請勿重複使用或重新消毒針筒及針頭。`,
      '注意事項': `【主要警示】
・死亡、嚴重心血管事件及血栓栓塞事件、以及腫瘤惡化的病例有增加的現象。
・腎衰竭：應視個人狀況調整劑量，以使血紅素值達到並維持於10至12 g/dl的範圍內。
・癌症：Mircera並不適用於治療癌症化療所引起的貧血。

【其他注意事項】
・高血壓：治療期間務必嚴密監測並控制血壓。
・癲癇發作：開始治療的最初幾個月應嚴密監視血壓及神經學症狀前兆。
・單純紅血球再生不良（PRCA）：曾有因出現中和性紅血球生成素抗體而發生PRCA與嚴重貧血的報告。
・實驗室檢測：應每兩週監測一次血紅素，直到血紅素值達到穩定狀態。

若有疑問，請諮詢您的醫生或藥師。`
    }
  }
};

const pendingQuestions = new Map(); // 暫存待確認的問題

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const userText = event.message.text.trim();
  const userId = event.source.userId;

  // 查詢自己的 userId
  if (userText === '我的ID') {
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: `您的 ID 是：${userId}` }]
    });
    return;
  }

  // 觸發藥品輪播
  if (userText === '我要問問題') {
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'template',
          altText: '請選擇您想了解的藥品',
          template: {
            type: 'carousel',
            columns: [
              {
                thumbnailImageUrl: 'https://res.cloudinary.com/dapa3qeg6/image/upload/q_auto/f_auto/v1775915269/%E5%90%B8%E5%BF%85%E6%93%B4_%E6%B0%A3%E5%8C%96%E5%99%B4%E9%9C%A7%E5%8A%91_munlnj.png',
                title: '吸必擴氣化噴霧劑',
                text: 'Symbicort Rapihaler',
                actions: [{ type: 'message', label: '問問題', text: '了解「吸必擴氣化噴霧劑」' }]
              },
              {
                thumbnailImageUrl: 'https://res.cloudinary.com/dapa3qeg6/image/upload/q_auto/f_auto/v1775915269/%E6%98%82%E5%B8%9D%E5%8D%9A_wyppmx.png',
                title: '昂帝博吸入膠囊',
                text: 'Ultibro Breezhaler',
                actions: [{ type: 'message', label: '問問題', text: '了解「昂帝博吸入膠囊」' }]
              },
              {
                thumbnailImageUrl: 'https://res.cloudinary.com/dapa3qeg6/image/upload/q_auto/f_auto/v1775915269/%E7%B6%AD%E8%92%82%E6%96%AF_xdd367.png',
                title: '維蒂斯眼用凝膠',
                text: 'Vidisic Eye Gel',
                actions: [{ type: 'message', label: '問問題', text: '了解「維蒂斯眼用凝膠」' }]
              },
              {
                thumbnailImageUrl: 'https://res.cloudinary.com/dapa3qeg6/image/upload/q_auto/f_auto/v1775915269/%E7%BE%8E%E8%A1%80%E6%A8%82%E9%87%9D%E7%AD%92%E8%A3%9D%E6%B3%A8%E5%B0%84%E5%8A%91_jbcnlu.png',
                title: '美血樂針筒裝注射劑',
                text: 'Mircera inj 50mcg/0.3mL',
                actions: [{ type: 'message', label: '問問題', text: '了解「美血樂針筒裝注射劑」' }]
              },
              {
                thumbnailImageUrl: 'https://res.cloudinary.com/dapa3qeg6/image/upload/q_auto/f_auto/v1775915269/%E8%80%B3%E5%A4%9A%E8%B4%8A%E9%82%A6_hupggq.png',
                title: '耳多贊邦點耳液劑',
                text: 'Otozambon Ear Drops',
                actions: [{ type: 'message', label: '問問題', text: '了解「耳多贊邦點耳液劑」' }]
              },
              {
                thumbnailImageUrl: 'https://res.cloudinary.com/dapa3qeg6/image/upload/q_auto/f_auto/v1775915269/%E9%81%A9%E5%96%98%E6%A8%82_oqhdpc.png',
                title: '適喘樂舒沛噴吸入劑',
                text: 'Tiotropium 2.5 mcg',
                actions: [{ type: 'message', label: '問問題', text: '了解「適喘樂舒沛噴吸入劑」' }]
              }
            ]
          }
        }
      ]
    });
    return;
  }

  // 點了藥品卡片 → 顯示該藥品的 Quick Reply
  if (medicines[userText]) {
    const med = medicines[userText];
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: `請選擇您想了解「${med.prefix}」的項目：`,
          quickReply: makeQuickReply(med.prefix)
        }
      ]
    });
    return;
  }

  // 點了 Quick Reply 選項 → 找對應藥品回覆
  const match = userText.match(/^(.+)｜(.+)$/);
  if (match) {
    const prefix = match[1];
    const topic = match[2];
    const med = Object.values(medicines).find(m => m.prefix === prefix);
    if (med && med.replies[topic]) {
      await client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: 'text',
            text: med.replies[topic],
            quickReply: makeQuickReply(prefix)
          }
        ]
      });
      return;
    }
  }

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwoNNQad7gzMT2Tq-Uih-GnXjE5yHrGXQcTnllZ7LLk-be4_n-99nbk9izJBD0Vdrks/exec';

  // 查詢使用者過去的問題
  if (userText === '下次問醫生的問題') {
    const res = await fetch(`${APPS_SCRIPT_URL}?userId=${userId}`);
    const json = await res.json();
    const replyText = json.questions.length > 0
      ? `您曾經問過的問題：\n${json.questions.join('\n')}`
      : '您還沒有紀錄任何問題。';

    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: replyText }]
    });
    return;
  }

  // 查詢使用者的藥品清單
  if (userText === '我的藥品') {
    const res = await fetch(`${APPS_SCRIPT_URL}?userId=${userId}&type=medicines`);
    const json = await res.json();
    const listText = json.medicines.length > 0
      ? `您的藥品清單：\n${json.medicines.map((m, i) => `${i + 1}. ${m}`).join('\n')}`
      : '您還沒有新增任何藥品。';

    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: listText,
          quickReply: {
            items: [
              { type: 'action', action: { type: 'message', label: '新增藥品', text: '新增藥品' } }
            ]
          }
        }
      ]
    });
    return;
  }

  // 顯示六種藥品供選擇
  if (userText === '新增藥品') {
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: '請選擇要新增的藥品：',
          quickReply: {
            items: Object.keys(medicines).map(name => ({
              type: 'action',
              action: { type: 'message', label: medicines[name].prefix, text: `新增｜${name}` }
            }))
          }
        }
      ]
    });
    return;
  }

  // 新增藥品確認
  const addMatch = userText.match(/^新增｜(.+)$/);
  if (addMatch) {
    const medName = addMatch[1];
    const med = medicines[medName];
    if (med) {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'addMedicine',
          userId: userId,
          medicine: med.prefix
        })
      });
      await client.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: `已新增「${med.prefix}」到您的藥品清單 ✅` }]
      });
      return;
    }
  }

  // 使用者確認要記錄問題
  if (userText === '是，記錄下來') {
    const question = pendingQuestions.get(userId);
    pendingQuestions.delete(userId);
    if (question) {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, question })
      });
      await client.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: '我記下來了！下次回診時可以帶著這個問題去問醫師或藥師 📋' }]
      });
    }
    return;
  }

  if (userText === '不用了') {
    pendingQuestions.delete(userId);
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: '好的，沒有記錄。' }]
    });
    return;
  }

  // 手動輸入、問答集沒有收錄 → 詢問是否記錄
  pendingQuestions.set(userId, userText);
  await client.replyMessage({
    replyToken: event.replyToken,
    messages: [
      {
        type: 'text',
        text: '目前沒有收錄這個問題，您想把問題記錄下來，下次問醫生嗎？',
        quickReply: {
          items: [
            { type: 'action', action: { type: 'message', label: '是，記錄下來', text: '是，記錄下來' } },
            { type: 'action', action: { type: 'message', label: '不用了', text: '不用了' } }
          ]
        }
      }
    ]
  });
}

app.listen(3000, () => console.log('Bot running on port 3000'));
