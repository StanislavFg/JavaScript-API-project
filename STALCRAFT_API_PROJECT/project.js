import fetch from "node-fetch";

const REGION = "na"; //North American game region, if needed, can be switched to EU, SEA, or RU
const ITEM_ID = "y3nmw"; // replace with the target item ID
const API_URL = `https://dapi.stalcraft.net/${REGION}/auction/${ITEM_ID}/lots`; // TEST URL

const TOKEN = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwibmJmIjoxNjczNzk3ODM4LCJleHAiOjQ4MjczOTc4MzgsImlhdCI6MTY3Mzc5NzgzOCwianRpIjoiYXhwbzAzenJwZWxkMHY5dDgzdzc1N2x6ajl1MmdyeHVodXVlb2xsZ3M2dml1YjVva3NwZTJ3eGFrdjJ1eWZxaDU5ZDE2ZTNlN2FqdW16Z3gifQ.ZNSsvwAX72xT5BzLqqYABuH2FGbOlfiXMK5aYO1H5llG51ZjcPvOYBDRR4HUoPZVLFY8jyFUsEXNM7SYz8qL9ePmLjJl6pib8FEtqVPmf9ldXvKkbaaaSp4KkJzsIEMY_Z5PejB2Vr-q-cL13KPgnLGUaSW-2X_sHPN7VZJNMjRgjw4mPiRZTe4CEpQq0BEcPrG6OLtU5qlZ6mLDJBjN2xtK0DI6xgmYriw_5qW1mj1nqF_ewtUiQ1KTVhDgXnaNUdkGsggAGqyicTei0td6DTKtnl3noD5VkipWn_CwSqb2Mhm16I9BPfX_d5ARzWrnrwPRUf6PA_7LipNU6KkkW0mhZfmwEPTm_sXPus0mHPENoVZArdFT3L5sOYBcpqwvVIEtxRUTdcsKp-y-gSzao5muoyPVoCc2LEeHEWx0cIi9spsZ46SPRQpN4baVFp7y5rp5pjRsBKHQYUJ0lTmh1_vyfzOzbtNN2v6W_5w9JTLrN1U6fhmifvKHppFSEqD6DameL1TC59kpIdufRkEU9HE4O-ErEf1GuJFRx-Dew6XDvb_ExhvEqcw31yNvKzpVqLYJfLazqn6tUbVuAiPwpy6rP9tYO2taT1vj5TGn_vxwDu9zoLWe796tFMPS-kmbCglxB5C9L4EbpfWNbWxYjUkTvjT2Ml9OnrB0UbYo1jI"; //TOKEN IS TEST
const THRESHOLD = 68000;

async function sendTelegramMessage(text) {
    const botToken = "TOKEN";
    const chatId = "ID";
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: text })
    });
}

async function checkLots() {
    try {
        const res = await fetch(API_URL, {
            headers: { "Authorization": TOKEN }
        });

        if (!res.ok) {
            console.error("API error:", res.status, await res.text());
            return;
        }

        const data = await res.json();
        console.log(`[${new Date().toLocaleTimeString()}] API answer:`, data);

        console.log(`Lots: ${data.total}`);


        if (!data || data.total === 0) {
            console.log("No lots available.");
            return;
        }


        let found = false;
        let minPrice = Infinity;

        for (const lot of data.lots) {
            const pricePerItem = lot.buyoutPrice / lot.amount;
            if (pricePerItem < minPrice) minPrice = pricePerItem;

            if (pricePerItem <= THRESHOLD) {
                found = true;
                console.log(`Needed lot: ${pricePerItem} per piece. (${lot.amount} items.)`);
            }
        }

        console.log(`Minimum price at the moment: ${minPrice}`);

        if (found) {
            await sendTelegramMessage(`Price for ${ITEM_ID} dropped under ${THRESHOLD}! Right now: ${minPrice} per piece, total amount: ${data.total} lots.`);
        }
    } catch (err) {
        console.error("Error while requesting", err);
    }
}

while (true) {
    await checkLots();
    await new Promise(res => setTimeout(res, 30000));
}
