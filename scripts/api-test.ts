async function main() {
  const response = await fetch(
    "http://localhost:3000/api/vote/f54b8c9a-e0ff-4679-bdc8-733d4c124816",
    {
      headers: {
        accept: "*/*",
        "accept-language": "cs,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
        "content-type": "application/json",
        "sec-ch-ua":
          '"Chromium";v="136", "Microsoft Edge";v="136", "Not.A/Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        Cookie:
          "next-auth.csrf-token=7fcb9ae423ff0dabaea295d1cf68985fd88aa3fb11a9c18b970c1e0a6d876e07%7C4161269039ff032aecce9c0b5ec78d32fda339e8969631639bae8641207fb0fc; locale=cz-CZ; next-auth.callback-url=http%3A%2F%2Flocalhost%3A3000%2Fcz%2Fadmin; next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..ivky5Yeh2zVjHaKO.pw_BabXl0xZinIDB4rOxlzv-_JITBoYqLYTBHBGAReH9PyFctxdkKoZBq1ZTNADBgbJOoukGAyFfHcsvaG_98a56a8b7FauKydJeUp-ZZyMLmbN5hFWVtWN1Mf9Eli4X2FnIrh2blKAyXsbe4NFRtD1UMjuQlqF2DJhNp6-WS9uRvDwCl7DTpUlhshPEfMdhhn7D1PlBQc0pja6ccrs5mrsKY9Ik1nRZZaRKhZuOFn-KbdhjS64adWoRyH_5k_Q6Q1fREaRy2OdP92kd.SYjviDBjB9JaI8iZANewNA",
      },
      referrer:
        "http://localhost:3000/cz/voting/f54b8c9a-e0ff-4679-bdc8-733d4c124816",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: '{"films":[40,48,40],"timestamp":"2025-05-10T14:06:55.734Z"}',
      method: "POST",
      mode: "cors",
      credentials: "include",
      cache: "no-store",
    }
  );
  const json = await response.json();
  if (!response.ok) {
    console.error("Error", response.status, json);
  } else {
    console.log("Success", json);
  }
}

for (let i = 0; i < 50; i++) {
  main().catch((err) => console.error(err));
}
