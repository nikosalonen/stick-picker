import type { Text } from "./i18n";
import type { AgeGroup, Hand, KickPoint, Level, Position, ShotStyle, SizeCategory } from "./logic/recommend";

const t = (en: string, fi: string): Text => ({ en, fi });

export const copy = {
  appName: t("Stick Picker", "Mailaopas"),
  navGuide: t("Guide", "Opas"),
  navFind: t("Find a stick", "Etsi maila"),
  langSwitch: t("Suomeksi", "In English"),

  home: {
    title: t("Which hockey stick should we buy?", "Millaisen jääkiekkomailan ostaisimme?"),
    lead: t(
      "Answer a few questions about the player. You get a short list to show in the shop, and every number explained in plain words.",
      "Vastaa muutamaan kysymykseen pelaajasta. Saat lyhyen listan, jonka voit näyttää kaupassa, ja jokainen numero selitetään selkokielellä.",
    ),
    start: t("Find the right stick", "Etsi sopiva maila"),
    startNote: t("About 1 minute", "Noin minuutti"),
    guide: t("Explain the basics first", "Selitä ensin perusasiat"),
    decoderTitle: t("Every stick label says five things", "Jokaisessa mailassa lukee viisi asiaa"),
    decoderLead: t(
      "Tap a part of the stick to see what it means.",
      "Napauta mailan kohtaa, niin näet mitä se tarkoittaa.",
    ),
    allRounderTitle: t("Just want a good all-rounder?", "Riittääkö hyvä perusmaila?"),
    allRounderBody: t(
      "That's the default here. Three quick questions about the player are enough for a stick that works for most kids and adults. Skip the rest.",
      "Se on täällä oletus. Kolme nopeaa kysymystä pelaajasta riittää mailaan, joka sopii useimmille lapsille ja aikuisille. Loput voi ohittaa.",
    ),
  },

  label: {
    size: t("Size", "Koko"),
    sizeBody: t(
      "Youth, Junior, Intermediate or Senior. Chosen by height and weight, not by age.",
      "Youth, Junior, Intermediate tai Senior. Valitaan pituuden ja painon mukaan, ei iän.",
    ),
    flex: t("Flex", "Jäykkyys (flex)"),
    flexBody: t(
      "How stiff the stick is. A smaller number is softer, which makes it easier to bend and shoot.",
      "Kuinka jäykkä maila on. Pienempi numero on pehmeämpi, ja sellaista on helpompi taivuttaa laukaistessa.",
    ),
    curve: t("Curve", "Lapa"),
    curveBody: t(
      "The shape of the blade. Most brands now use the same code names, like P92 or P88.",
      "Lavan muoto. Useimmat merkit käyttävät nykyään samoja koodeja, kuten P92 tai P88.",
    ),
    hand: t("Hand", "Kätisyys"),
    handBody: t(
      "L or R: the side the blade is on. Left means the left hand is lower on the stick.",
      "L tai R: kummalla puolella lapa on. Vasen tarkoittaa, että vasen käsi on alempana varressa.",
    ),
    length: t("Length", "Pituus"),
    kick: t("Kick point", "Taipumispiste"),
    lengthBody: t(
      "Uncut length in inches. Sticks are sold long and cut to fit the player.",
      "Leikkaamaton pituus tuumina. Mailat myydään pitkinä ja lyhennetään pelaajalle sopiviksi.",
    ),
  },

  quiz: {
    stepOf: (n: number, total: number) => t(`Question ${n} of ${total}`, `Kysymys ${n}/${total}`),
    back: t("Back", "Takaisin"),
    next: t("Next", "Seuraava"),
    showResult: t("Show the stick", "Näytä maila"),

    ageTitle: t("How old is the player?", "Minkä ikäinen pelaaja on?"),
    ageHint: t(
      "Age only helps with the first guess. Height and weight decide the size.",
      "Ikä auttaa vain ensimmäisessä arviossa. Koon ratkaisevat pituus ja paino.",
    ),
    ages: {
      under7: t("Under 7", "Alle 7"),
      "7to9": t("7–9", "7–9"),
      "10to13": t("10–13", "10–13"),
      "14to17": t("14–17", "14–17"),
      adult: t("Adult", "Aikuinen"),
    } satisfies Record<AgeGroup, Text>,

    bodyTitle: t("How tall and how heavy?", "Kuinka pitkä ja kuinka painava?"),
    bodyHint: t(
      "Rough numbers are fine. Height without skates.",
      "Suuntaa-antavat luvut riittävät. Pituus ilman luistimia.",
    ),
    height: t("Height", "Pituus"),
    weight: t("Weight", "Paino"),

    handTitle: t("Which way does the player hold a stick?", "Miten päin pelaaja pitää mailaa?"),
    handHint: t(
      "This is not about which hand they write with. Many right-handed people shoot left.",
      "Tämä ei riipu siitä, kummalla kädellä pelaaja kirjoittaa. Moni oikeakätinen pelaa vasenta.",
    ),
    hands: {
      left: t("Left", "Vasen"),
      right: t("Right", "Oikea"),
      unsure: t("Not sure", "En tiedä"),
    } satisfies Record<Hand, Text>,
    handsDetail: {
      left: t("Left hand lower on the stick", "Vasen käsi alempana varressa"),
      right: t("Right hand lower on the stick", "Oikea käsi alempana varressa"),
      unsure: t("We'll show a quick test", "Näytämme nopean testin"),
    } satisfies Record<Hand, Text>,
    broomTitle: t("Try the broom test", "Kokeile harjatestiä"),
    broomBody: t(
      "Hand the player a broom and ask them to sweep the floor. Look at the hand that ends up lower on the handle. Left hand lower means a left stick. Right hand lower means a right stick.",
      "Anna pelaajalle harja ja pyydä lakaisemaan lattiaa. Katso, kumpi käsi on alempana varressa. Vasen käsi alempana tarkoittaa vasenta mailaa, oikea käsi alempana oikeaa mailaa.",
    ),
    broomTip: t(
      "Still unsure? Ask the coach, or let the player try both in the shop.",
      "Vieläkin epävarmaa? Kysy valmentajalta tai anna pelaajan kokeilla molempia kaupassa.",
    ),

    checkpointTitle: t("That's enough for a good all-round stick", "Tämä riittää hyvään perusmailaan"),
    checkpointBody: t(
      "Three more questions can fine-tune it for how the player plays. If you don't know the answers, skip them.",
      "Kolmella lisäkysymyksellä mailan voi hienosäätää pelaajan pelityylin mukaan. Jos et tiedä vastauksia, ohita ne.",
    ),
    fineTune: t("Fine-tune with 3 more questions", "Hienosäädä kolmella kysymyksellä"),

    levelTitle: t("How much has the player played?", "Kuinka paljon pelaaja on pelannut?"),
    levels: {
      new: t("Just starting", "Vasta aloittamassa"),
      team: t("Plays in a team", "Pelaa joukkueessa"),
      competitive: t("Plays a lot, competitive", "Pelaa paljon, tavoitteellisesti"),
    } satisfies Record<Level, Text>,
    levelsDetail: {
      new: t("Skating school, first seasons, or adult beginner", "Luistelukoulu, ensimmäiset kaudet tai aikuisena aloittanut"),
      team: t("Regular practices and games", "Säännölliset harjoitukset ja pelit"),
      competitive: t("Several practices a week, strong shot", "Useita harjoituksia viikossa, kova laukaus"),
    } satisfies Record<Level, Text>,

    positionTitle: t("Where do they play?", "Missä pelipaikassa hän pelaa?"),
    positions: {
      forward: t("Forward", "Hyökkääjä"),
      defense: t("Defense", "Puolustaja"),
      unsure: t("Not decided / don't know", "Ei vakiintunut / en tiedä"),
    } satisfies Record<Position, Text>,
    positionsDetail: {
      forward: t("Plays near the opponent's goal", "Pelaa lähellä vastustajan maalia"),
      defense: t("Stays back, shoots from far", "Pysyy takana, laukoo kaukaa"),
      unsure: t("Young players often switch", "Nuoret pelaajat vaihtavat usein"),
    } satisfies Record<Position, Text>,

    shotTitle: t("What kind of shots do they like?", "Millaisia laukauksia hän tykkää laukoa?"),
    shots: {
      quick: t("Quick shots near the goal", "Nopeita laukauksia maalin edestä"),
      power: t("Hard slapshots from far", "Kovia lämäreitä kaukaa"),
      unsure: t("Don't know: make it all-round", "En tiedä: monipuolinen"),
    } satisfies Record<ShotStyle, Text>,
    shotsDetail: {
      quick: t("Wrist shots, snap shots, fast release", "Ranteet, vedot, nopea irtoaminen"),
      power: t("Big wind-up, one-timers", "Iso taakse vienti, suorat laukaukset"),
      unsure: t("The best choice for most players", "Paras valinta useimmille"),
    } satisfies Record<ShotStyle, Text>,
  },

  result: {
    title: t("Ask the shop for this stick", "Pyydä kaupasta tällaista mailaa"),
    lead: t(
      "Show this list in the shop, or send the link to whoever is buying.",
      "Näytä tämä lista kaupassa tai lähetä linkki ostajalle.",
    ),
    copy: t("Copy list", "Kopioi lista"),
    copied: t("Copied", "Kopioitu"),
    share: t("Share link", "Jaa linkki"),
    linkCopied: t("Link copied", "Linkki kopioitu"),
    edit: t("Change answers", "Muuta vastauksia"),
    alsoFine: t("Also fine", "Käy myös"),
    otherNames: t("Other brands", "Muilla merkeillä"),
    yourStick: t("Your stick", "Sinun mailasi"),
    cutTo: (cm: number, inches: number) => t(`Cut to about ${cm} cm (${inches}")`, `Lyhennä noin ${cm} cm:iin (${inches}")`),
    buyLength: (inches: number) => t(`Buy ${inches}" long`, `Osta ${inches}" pituinen`),
    noCut: t("No cutting needed", "Ei tarvitse lyhentää"),
    handUnsure: t("Test first: see the broom test", "Testaa ensin: katso harjatesti"),
    kickNoMatter: t("Any is fine at this stage", "Mikä tahansa käy tässä vaiheessa"),
    budget: t("Budget", "Hinta"),
    budgetKids: t(
      "Kids outgrow a stick in a season or two. A value model or last season's model is plenty.",
      "Lapsi kasvaa mailasta ulos kaudessa tai kahdessa. Edullinen malli tai viime kauden malli riittää hyvin.",
    ),
    budgetAdults: t(
      "Mid-range is the sweet spot. The top models are lighter, not easier to play with.",
      "Keskihintainen on paras valinta. Kalleimmat mallit ovat kevyempiä, eivät helpompia pelata.",
    ),
    whyTitle: t("Why these numbers", "Miksi juuri nämä"),
    why: t("Why?", "Miksi?"),
  },

  sizes: {
    youth: t("Youth", "Youth"),
    junior: t("Junior", "Junior"),
    intermediate: t("Intermediate", "Intermediate"),
    senior: t("Senior", "Senior"),
  } satisfies Record<SizeCategory, Text>,
  sizeShort: { youth: "YTH", junior: "JR", intermediate: "INT", senior: "SR" } satisfies Record<SizeCategory, string>,

  kicks: {
    low: t("Low kick", "Matala taipumispiste"),
    hybrid: t("Hybrid kick", "Hybridi"),
    mid: t("Mid kick", "Keskitaipuma"),
  } satisfies Record<KickPoint, Text>,
  kicksPlain: {
    low: t("Quick release", "Nopea laukaus"),
    hybrid: t("All-round", "Monipuolinen"),
    mid: t("Power", "Voima"),
  } satisfies Record<KickPoint, Text>,
  kicksBody: {
    low: t(
      "Bends near the blade. The puck leaves fast with little wind-up. Suits forwards who shoot close to the goal.",
      "Taipuu läheltä lapaa. Kiekko lähtee nopeasti ilman isoa taakse vientiä. Sopii hyökkääjille, jotka laukovat läheltä maalia.",
    ),
    hybrid: t(
      "Bends where the player pushes. Works for quick shots and hard shots. The best default.",
      "Taipuu sieltä, mihin pelaaja painaa. Toimii sekä nopeissa että kovissa laukauksissa. Paras oletusvalinta.",
    ),
    mid: t(
      "Bends in the middle of the shaft. Stores more power for big slapshots. Suits defensemen.",
      "Taipuu varren keskeltä. Varastoi enemmän voimaa isoihin lämäreihin. Sopii puolustajille.",
    ),
  } satisfies Record<KickPoint, Text>,

  explain: {
    lengthTitle: t("Length: how long?", "Pituus: kuinka pitkä?"),
    lengthBody: t(
      "Stand the stick upright on the tip of the blade, in front of the player, in shoes. The top should reach between the chin and the nose. In skates it reaches about the chin.",
      "Nosta maila pystyyn lavan kärjen varaan pelaajan eteen, kengät jalassa. Varren pään pitäisi ulottua leuan ja nenän väliin. Luistimet jalassa se ulottuu suunnilleen leukaan.",
    ),
    lengthMore: t(
      "Shorter is easier for handling the puck. Longer reaches further, which defensemen like. Don't buy a long stick to grow into: it makes everything harder.",
      "Lyhyemmällä on helpompi käsitellä kiekkoa. Pidempi ulottuu kauemmas, mistä puolustajat pitävät. Älä osta liian pitkää kasvunvaraksi: se vaikeuttaa kaikkea.",
    ),
    nose: t("Nose", "Nenä"),
    chin: t("Chin", "Leuka"),
    shorterControl: t("Shorter: more control", "Lyhyempi: parempi hallinta"),
    longerReach: t("Longer: more reach", "Pidempi: enemmän ulottuvuutta"),

    flexTitle: t("Flex: how stiff?", "Flex: kuinka jäykkä?"),
    flexBody: t(
      "The flex number is how many pounds of push it takes to bend the stick by one inch (2.5 cm). A soft stick bends easily, so the player can load it and the puck flies off faster. A stick that is too stiff feels like a plank.",
      "Flex-luku kertoo, kuinka monen paunan voima tarvitaan taivuttamaan mailaa tuuman (2,5 cm) verran. Pehmeä maila taipuu helposti, joten pelaaja saa sen latautumaan ja kiekko lähtee kovempaa. Liian jäykkä maila tuntuu laudalta.",
    ),
    flexRule: t(
      "Rule of thumb: about half the body weight in pounds (body weight in kg × 1.1), a bit less for beginners. When in doubt, go softer.",
      "Nyrkkisääntö: noin puolet painosta paunoina (paino kiloina × 1,1), aloittelijalle hieman vähemmän. Jos epäilyttää, valitse pehmeämpi.",
    ),
    flexCut: t(
      "Cutting makes a stick stiffer, about 4 flex points for every inch (2.5 cm) cut off. That is why we suggest a lower number on the label.",
      "Lyhentäminen jäykistää mailaa, noin 4 flex-pistettä jokaista lyhennettyä tuumaa (2,5 cm) kohti. Siksi ehdotamme pienempää lukua kuin paino antaisi olettaa.",
    ),
    flexAfter: (label: number, after: number) =>
      t(
        `Your stick: ${label} on the label, feels like about ${after} after cutting.`,
        `Sinun mailasi: tarrassa ${label}, lyhennettynä tuntuu noin ${after}:ltä.`,
      ),
    softer: t("Softer", "Pehmeämpi"),
    stiffer: t("Stiffer", "Jäykempi"),
    pushLabel: t("Push on the stick", "Paina mailaa"),
    pushResult: (cm: string, flex: number) =>
      t(`A flex ${flex} stick bends about ${cm} cm`, `Flex ${flex} -maila taipuu noin ${cm} cm`),
    tryFlex: t("Compare flex", "Vertaa jäykkyyttä"),

    kickTitle: t("Kick point: where does it bend?", "Taipumispiste: mistä maila taipuu?"),
    kickBody: t(
      "Every stick bends when you shoot. The kick point is where the bend happens. It matters less than length and flex, and hardly at all for young kids.",
      "Jokainen maila taipuu laukauksessa. Taipumispiste kertoo, mistä kohtaa. Se on vähemmän tärkeä kuin pituus ja jäykkyys, eikä pienillä lapsilla juuri merkitse mitään.",
    ),

    curveTitle: t("Curve: which blade shape?", "Lapa: millainen kaarre?"),
    curveBody: t(
      "Seen from above, the blade bends. Where it bends (near the heel, the middle or the toe) and how much changes how the puck behaves. A deep curve at the toe helps quick shots but makes passing and backhands harder.",
      "Ylhäältä katsottuna lapa on kaareva. Se, mistä kohtaa (kanta, keskikohta vai kärki) ja kuinka paljon lapa kaartuu, vaikuttaa kiekon käytökseen. Syvä kärkikaarre auttaa nopeissa laukauksissa, mutta vaikeuttaa syöttöjä ja rystyjä.",
    ),
    curveTip: t(
      "If in doubt, pick P92 or P88. They are the most common all-round curves and every shop has them.",
      "Jos epäröit, valitse P92 tai P88. Ne ovat yleisimmät monipuoliset lavat, ja niitä löytyy joka kaupasta.",
    ),
    heel: t("Heel", "Kanta"),
    toe: t("Toe", "Kärki"),
    face: t("Face", "Lavan kulma"),
    location: t("Curve at", "Kaarre"),
    sameAs: t("Same curve at other brands", "Sama lapa muilla merkeillä"),
    beginner: t("Good for beginners", "Sopii aloittelijalle"),
    recommended: t("Recommended", "Suositus"),
    notBeginner: t("Better for experienced players", "Kokeneemmille"),
    lie: t("Lie", "Lie"),
    lieBody: t(
      "Lie is the angle between blade and shaft. Most curves are 5 to 6, which suits almost everyone. If only the heel or only the toe touches the ice when the player stands in their normal stance, ask the shop about lie.",
      "Lie on lavan ja varren välinen kulma. Useimmissa lavoissa se on 5–6, mikä sopii lähes kaikille. Jos pelaajan normaalissa asennossa jäähän osuu vain lavan kanta tai kärki, kysy kaupasta lie-kulmasta.",
    ),

    handTitle: t("Hand: left or right?", "Kätisyys: vasen vai oikea?"),
    handBody: t(
      "A left stick has the blade on the player's left side, with the left hand lower on the shaft and the right hand at the top. It has nothing to do with writing hand. Left sticks are more common, so shops stock more of them.",
      "Vasemmassa mailassa lapa on pelaajan vasemmalla puolella: vasen käsi on alempana varressa ja oikea ylhäällä. Kirjoituskädellä ei ole merkitystä. Vasen on yleisempi, joten kaupoissa on niitä enemmän.",
    ),

    gripTitle: t("Grip or no grip?", "Grip vai ei?"),
    gripBody: t(
      "Grip sticks have a slightly tacky coating so hands don't slip. Most players like it, especially beginners. Some prefer a smooth finish so the top hand slides easily. Either is fine.",
      "Grip-mailoissa on hieman tahmea pinta, joten kädet eivät luista. Useimmat pitävät siitä, etenkin aloittelijat. Osa haluaa sileän pinnan, jotta yläkäsi liukuu helposti. Kumpikin käy.",
    ),

    brandsTitle: t("Which brand?", "Mikä merkki?"),
    brandsBody: t(
      "All the big brands make good sticks. Each brand has a few families with a different feel: a quick one, an all-round one and a power one. Pick the family first, then the price level.",
      "Kaikki isot merkit tekevät hyviä mailoja. Jokaisella merkillä on muutama mallisarja, joilla on eri tuntuma: nopea, monipuolinen ja voimakas. Valitse ensin sarja, sitten hintataso.",
    ),
    brandsMatch: t("Matches your stick", "Sopii sinun mailaasi"),
    tiersTitle: t("Price levels", "Hintatasot"),
    tiersBody: t(
      "Each family comes in three price levels. The models are listed from most to least expensive. Senior list prices in the US for 2026–27: top about $370–420, mid about $190–230, value about $130–180. Junior and youth sticks cost less. Last season's model is usually the best deal.",
      "Jokaisesta sarjasta on kolme hintatasoa. Mallit on listattu kalleimmasta edullisimpaan. Senior-mailojen ohjehinnat Yhdysvalloissa kaudella 2026–27: huippumalli noin 370–420 $, keskitaso noin 190–230 $, edullinen noin 130–180 $. Junior- ja youth-mailat ovat halvempia. Viime kauden malli on yleensä paras ostos.",
    ),
    tiers: [t("Top", "Huippu"), t("Mid", "Keski"), t("Value", "Edullinen")],
    noFamily: t("No family this season", "Ei sarjaa tällä kaudella"),
    brandsUpdated: t(
      "Model names change every year or two. The family names stay the same, so ask for the family.",
      "Mallinimet vaihtuvat vuoden tai kahden välein. Sarjojen nimet pysyvät, joten kysy sarjan nimellä.",
    ),

    sizesTitle: t("Size chart", "Kokotaulukko"),
    sizesBody: t(
      "Typical ranges. Brands differ by a few centimetres, and sizes overlap. Between two sizes? The smaller size is usually softer and lighter.",
      "Tyypilliset vaihteluvälit. Merkit eroavat muutamalla sentillä, ja koot menevät osin päällekkäin. Kahden koon välissä? Pienempi koko on yleensä pehmeämpi ja kevyempi.",
    ),
    colSize: t("Size", "Koko"),
    colAge: t("Typical age", "Tyypillinen ikä"),
    colHeight: t("Player height", "Pelaajan pituus"),
    colLength: t("Stick length", "Mailan pituus"),
    colFlex: t("Flex", "Flex"),
    sizeAges: {
      youth: t("4–8", "4–8"),
      junior: t("7–12", "7–12"),
      intermediate: t("11–15", "11–15"),
      senior: t("14+", "14+"),
    } satisfies Record<SizeCategory, Text>,

    mistakesTitle: t("Common mistakes", "Yleiset virheet"),
    mistakes: [
      t("Buying a long stick to grow into. A stick that is too long makes skating with the puck much harder.", "Liian pitkä maila kasvunvaraksi. Liian pitkällä mailalla kiekon kuljettaminen on paljon vaikeampaa."),
      t("Too stiff. An adult's old stick, cut short, is far too stiff for a child.", "Liian jäykkä. Aikuisen vanha maila lyhennettynä on lapselle aivan liian jäykkä."),
      t("Picking the hand from the writing hand. Use the broom test instead.", "Kätisyys kirjoituskäden mukaan. Käytä harjatestiä."),
      t("Paying for the top model. A beginner won't feel the difference, but the wallet will.", "Huippumallin ostaminen. Aloittelija ei huomaa eroa, mutta lompakko huomaa."),
      t("A deep toe curve for a beginner. It looks cool but makes passing and backhands harder.", "Syvä kärkilapa aloittelijalle. Näyttää hienolta, mutta vaikeuttaa syöttöjä ja rystyjä."),
    ],
  },

  guide: {
    title: t("Hockey sticks, explained", "Jääkiekkomailat selitettynä"),
    lead: t(
      "Everything on a stick label, in plain words. Want a recommendation instead?",
      "Kaikki mailan merkinnät selkokielellä. Haluatko mieluummin suosituksen?",
    ),
  },

  footer: t(
    "The recommendation is a starting point. Brand charts differ, so if you can, let the player hold the stick in the shop. Lineups: 2026–27 season.",
    "Suositus on lähtökohta. Merkkien taulukot eroavat toisistaan, joten anna pelaajan kokeilla mailaa kaupassa, jos mahdollista. Mallistot: kausi 2026–27.",
  ),
};
