// src/locales.pl.js
// Traductions polonaises du tunnel. Fusionnées dans `locales` (src/locales.js) sous la clé `pl`.
// Une clé absente ici retombe sur le français.

export const pl = {

    // --- TITRES DE LA PAGE ---
    "form.title.default": "Ekspresowa wycena fotobudki",
    "form.title.partner": "Wycena dla partnerów",
    "form.title.calc": "Cześć Héloïse i Cédric!",
    "form.title.calc_named": "Cześć {name}!",
    "form.calc.sales_note": "Wyceny zostaną utworzone na: {name} ({email})",

    // --- NAVIGATION BARRE ---
    "nav.step1": "Wydarzenie",
    "nav.step2": "Konfiguracja",
    "nav.step3": "Kontakt",

    // --- COMMUN ---
    "common.loading": "Ładowanie...",
    "common.free": "Bez kosztów dostawy",
    "common.included": "Gratis",
    "common.between": "Od",
    "common.and": "do",
    "step2.logistics.delivery_variable": "Zależnie od lokalizacji",

    // --- STEP 0: NUMERO CLIENT ---
    "step0.login.client_number": "Wpisz numer klienta",
    "step0.login.partner_number": "Wpisz numer partnera",
    "step0.placeholder.client_id": "Numer klienta",

    // --- STEP 1: ÉVÉNEMENT ---
    "step1.main_title": "Twoja fotobudka w 3 minuty",
    "step1.title": "Jakie wydarzenie organizujesz?",
    "step1.type.placeholder": "Wybierz rodzaj wydarzenia...",
    "step1.type.corporate": "Wydarzenie firmowe",
    "step1.type.wedding": "Wesele",
    "step1.type.birthday": "Urodziny",
    "step1.type.private": "Impreza prywatna",
    "step1.type.other": "Inne",
    "step1.isPro": "Jestem firmą (ceny netto i dostęp do opcji dla firm)",
    "step1.isPro.notice_title": "Ważne dla e-faktur:",
    "step1.isPro.notice": "wycena wystawiona na osobę prywatną nie może zostać zafakturowana na firmę.",
    "step1.date.label": "Data wydarzenia",
    "step1.duration.label": "Czas trwania (dni)",
    "step1.venue.label": "Nazwa miejsca (hotel, restauracja, dom prywatny...)",
    "step1.address.label": "Pełny adres miejsca",
    "step1.address.placeholder": "Wpisz adres...",
    "step1.venue.placeholder": "Np. Hotel Bristol",
    "step1.error.past_date": "Data nie może być z przeszłości",
    "step1.error.select_address": "Wybierz adres z listy podpowiedzi",
    "step1.today.title": "To na dziś?",
    "step1.today.subtitle": "W przypadku rezerwacji na ten sam dzień skontaktuj się z nami telefonicznie, aby sprawdzić dostępność.",
    "step1.today.calc_title": "Rezerwacja na ten sam dzień",
    "step1.today.calc_subtitle": "⚠️ Przed potwierdzeniem zamówienia upewnij się, że kierowca jest dostępny.",
    "step1.lastminute.title": "Rezerwacja last minute",
    "step1.lastminute.desc": "Twoje wydarzenie jest tuż-tuż! Zrobimy wszystko, aby wybrany sprzęt był dostępny.",

    // --- STEP 2: CONFIG ---
    "step2.model.selection": "Wybrany model",
    "step2.modify": "Zmień",
    "step2.budget.est": "Szacunkowy budżet",
    "step2.delivery.incl": "(z dostawą)",
    "step2.degressive": "Taniej od 2. dnia",
    "step2.dynamic_pricing": "Cena zależna od terminu",

    "step2.header.title": "Wybierz {brand}",
    "step2.header.desc": "To wybór wyjątkowej technologii i niezrównanej jakości. Każda z naszych fotobudek, zaprojektowanych we Francji, łączy wysokiej klasy optykę z profesjonalną drukarką. Nasza innowacja? Autorski, inteligentny system oświetlenia LED, który włącza się tylko w chwili robienia zdjęcia. Efekt: perfekcyjne zdjęcia jak ze studia, bez psucia klimatu imprezy. Jakość przede wszystkim.",

    "step2.collection.essential": "Kolekcja CineBooth!",
    "step2.collection.prestige": "Kolekcja Prestige",
    "step2.collection.immersive": "Wrażenia immersyjne",
    "step2.logistics.distance_notice": "Cena dostosowana do adresu wydarzenia",
    "step2.logistics.prestige_km": "Ponieważ miejsce wydarzenia jest oddalone od Paryża, doliczamy dopłatę logistyczną w wysokości {price}.",
    "step2.logistics.pro_badge_km": "Podstawowa dostawa w cenie",

    "step2.badge.pro": "Pro",
    "step2.badge.digital": "100% cyfrowo",
    "step2.badge.150prints": "150 wydruków",
    "step2.badge.unlimited": "Bez limitu",
    "step2.badge.immersion": "Immersja",

    "step2.model.digital.name": "Pakiet Cyfrowy",
    "step2.model.digital.tagline": "Wszystko, co niezbędne, 100% cyfrowo",
    "step2.model.digital.desc": "Nieograniczone udostępnianie e-mailem i SMS-em. Technologia Ultra HD dla nowoczesnej pamiątki, bez papierowych wydruków. Idealna fotobudka do komunikacji w mediach społecznościowych.",

    "step2.model.150.name": "Pakiet 150 wydruków",
    "step2.model.150.tagline": "Wybór klientów prywatnych",
    "step2.model.150.desc": "Idealny pakiet na wydarzenia do 60 osób. 150 wydruków w cenie, aby każdy gość wyszedł z 2–3 zdjęciami!",
    "step2.model.illimite.tagline": "Drukuj bez liczenia",
    "step2.model.signature.tagline": "Elegancja klasy premium",
    "step2.model.360.tagline": "Wspomnienia w 360 stopniach",

    "step2.model.starbooth.name": "Pakiet Bez Limitu",
    "step2.model.starbooth.badge": "Pro",
    "step2.model.starbooth.desc": "Profesjonalna wydajność w miniaturze! Ta fotobudka ma sensor Sony 4K f/1.2, adaptacyjną lampę LED i wytrzymałą drukarkę termiczną do błyskawicznych wydruków bez limitu.",

    "step2.model.signature.name": "Signature",
    "step2.model.signature.badge": "Targi, gale i wesela",
    "step2.model.signature.desc": "Absolutna elegancja na najbardziej prestiżowe wydarzenia. Magnetyczna obecność tej luksusowej fotobudki wzbudza emocje i dodaje blasku miejscu przyjęcia. Zapewnij gościom wrażenia jak w prawdziwym, profesjonalnym studiu fotograficznym.",

    "step2.model.360.name": "Videobooth 360°",
    "step2.model.360.desc": "Przenieś gości w sam środek akcji dzięki spektakularnym filmom 360°. W cenie 3 godziny obsługi przez nasz zespół i pełna personalizacja klimatu (muzyka, efekty wizualne i szablon na miarę). Gwóźdź programu!",
    "step2.model.360.setup_anim_incl": "Dostawa i 3 h obsługi w cenie",

    // Logistique & Options
    "step2.logistics.title": "Logistyka i uruchomienie",
    "step2.logistics.pro_setup": "Dostawa i montaż przez technika",
    "step2.logistics.pro_badge": "W cenie pakietu Prestige",
    "step2.logistics.pickup": "Odbiór osobisty w magazynie w Arcueil (94)",
    "step2.logistics.delivery": "Fotobudka dostarczona i uruchomiona",

    "step2.option.template.name": "Ramka zdjęcia",
    "step2.option.template.desc": "Spersonalizuj ramkę wokół zdjęć (logo, data, grafika...) w naszym narzędziu online, wgraj własny plik lub wybierz szablon z naszej biblioteki.",
    "step2.option.template.activate": "Włącz personalizację",
    "step2.option.included_label": "Opcja gratis",

    "step2.option.ia.name": "Tło AI",
    "step2.option.ia.desc": "Sztuczna inteligencja wykrywa tło i automatycznie zastępuje je realistyczną scenerią według Twojego wyboru!",
    "step2.option.ia.activate": "Włącz magiczne tło",

    "step2.option.prints.name": "Wydruki na zdjęcie",
    "step2.option.prints.desc": "Domyślnie fotobudka drukuje 1 odbitkę na ujęcie. Zwiększ liczbę wydruków, aby każdy gość na zdjęciu wyszedł ze swoją pamiątką.",
    "step2.option.prints.1print": "1 wydruk / zdjęcie (w cenie)",
    "step2.option.prints.nprints": "{n} szt. (+{p} {s} / dzień)",

    "step2.option.anim.label": "Obsługa na miejscu",
    "step2.option.anim.none": "Bez obsługi (fotobudka samoobsługowa)",
    "step2.option.anim.360_3h": "3 h obsługi (w cenie)",
    "step2.option.anim.nh": "{h} h (+{p} {s})",

    "step2.option.speaker.name": "Głośnik i muzyka",
    "step2.option.speaker.desc": "Muzyczna oprawa, która rozkręci gości i doda frajdy!",

    "step2.option.rgpd.name": "Pakiet Marketing i Dane",
    "step2.option.rgpd.desc": "Zamień gości w wartościowe kontakty. Zbieranie adresów e-mail zgodne z RODO do Twoich kampanii i eksport CSV.",

    "step2.error.360_multiday": "Videobooth 360° nie jest dostępny przy wynajmie na kilka dni.",
    "step2.error.anim_multiday": "Obsługa niedostępna przy wynajmie na kilka dni",

    // --- NAVIGATION ---
    "nav.prev": "Wstecz",
    "nav.next": "Dalej",
    "nav.generate": "Wygeneruj wycenę",
    "nav.receiving": "Oblicz cenę",
    "nav.calculating": "Obliczanie ceny...",
    "nav.submitting": "Generowanie...",

    // --- STEP 2 CONFIG (COMPLÉMENTS) ---
    "step2.check.availability": "Sprawdzanie dostępności...",
    "step2.check.analysis": "Analiza na {date}...",
    "step2.model.price.from": "Od",
    "step2.model.price.to": "do",
    "price.detail.base": "Usługa: {name}",
    "price.detail.template": "Profesjonalne narzędzie do szablonów",
    "price.detail.delivery": "Dostawa, montaż i odbiór",
    "price.detail.km_extra": "Dopłata za dojazd ({km} km)",
    "price.detail.pickup": "Odbiór osobisty (Arcueil)",
    "price.detail.prints": "{qty}x dopłata za wydruki",
    "price.detail.ai_bg": "Tło AI (personalizowane)",
    "price.detail.rgpd": "Zgodność z RODO",
    "price.detail.speaker": "Głośnik i muzyka w tle",
    "axonaut.opt.digital_props": "[Gratis] Cyfrowe gadżety i filtry",
    "axonaut.desc.digital_props": "Dodaj zdjęciom frajdy! Używaj modnych filtrów i ozdabiaj pozy zabawnymi naklejkami bezpośrednio na ekranie.",
    "price.detail.digital_props": "Cyfrowe gadżety (props)",

    // --- STEP 3: CONTACT ---
    "step3.name": "Imię i nazwisko",
    "step3.email": "Adres e-mail",
    "step3.phone": "Telefon",
    "step3.callback.title": "Potrzebujesz pomocy?",
    "step3.callback.subtitle": "Chcę, aby doradca oddzwonił do mnie jutro",
    "step3.billing.title": "Dane do faktury",
    "step3.company.name": "Nazwa firmy",
    "step3.same.addr": "Adres do faktury jest taki sam jak adres wydarzenia",
    "step3.contact.title": "Twoje dane kontaktowe",
    "step3.rgpd.notice": "Twoje dane są przetwarzane wyłącznie w celu obsługi wyceny. Zgodnie z RODO masz prawo dostępu do swoich danych i ich poprawiania.",
    "step3.billing.label": "Adres do faktury",
    "step3.billing.btn_same": "Taki sam jak miejsce",
    "step3.billing.btn_other": "Inny adres",
    "step3.billing.sub_other": "Dom, siedziba firmy...",

    "step3.billing.addr_name": "Nazwa adresu",
    "step3.billing.addr_name_ph": "Np. siedziba, biuro, dom...",

    "step3.billing.search": "Wyszukaj adres",
    "step3.billing.undefined": "Nie podano adresu",
    "step3.placeholder.name": "Jan KOWALSKI",
    "step3.placeholder.company": "Moja Firma Sp. z o.o.",
    "step3.placeholder.email": "jan@przyklad.pl",
    "step3.placeholder.phone": "+48 512 345 678",

    "step3.company.siren": "Numer SIREN (Francja)",
    "step3.placeholder.siren": "9 cyfr — np. 732 829 320",
    "step3.siren.hint": "Wymagany do e-faktury.",
    "step3.siren.hint_foreign": "Opcjonalny dla firm spoza Francji.",
    "step3.siren.error.required": "Numer SIREN jest wymagany, aby wystawić fakturę na francuską firmę.",
    "step3.siren.error.length": "Numer SIREN ma dokładnie 9 cyfr.",
    "step3.siren.error.siret": "Wpisano numer SIRET (14 cyfr). Zostaw tylko 9 pierwszych — to numer SIREN.",
    "step3.siren.error.checksum": "Ten numer SIREN jest nieprawidłowy, sprawdź wpisane dane.",

    // --- STEP 4: ECRAN FINAL ---
    "success.title": "Dziękujemy!",
    "success.subtitle": "Wycena została wygenerowana. Możesz ją teraz obejrzeć i podpisać online.",
    "success.view_quote": "Zobacz wycenę",
    "success.send_email": "Wyślij mi wycenę e-mailem",
    "success.email_sent": "E-mail wysłany!",
    "success.new_quote": "Utwórz kolejną wycenę",
    "step4.notice.full_payment": "Ponieważ Twoje wydarzenie odbędzie się za mniej niż 7 dni, potwierdzenie rezerwacji wymaga zapłaty całej kwoty.",
    "step4.checking_payment": "Sprawdzanie płatności...",
    "step4.title": "Podsumowanie i potwierdzenie",
    "step4.client_details": "Twoje dane",
    "step4.label.contact": "Kontakt",
    "step4.label.company": "Firma",
    "step4.label.venue": "Miejsce wydarzenia",
    "step4.label.date": "Data",
    "step4.order_title": "Twoje zamówienie",
    "step4.total_ttc": "Razem brutto",
    "step4.balance_notice": "Pozostała kwota jest płatna 10 dni przed wydarzeniem",
    "step4.edit": "Edytuj",
    "step4.address_not_specified": "Nie podano adresu.",
    "step4.payment.full_click": "Kliknij tutaj, aby zapłacić całość",
    "step4.payment.deposit_click": "Kliknij tutaj, aby wpłacić zaliczkę",
    "step4.payment.full_title": "Płatność za zamówienie (100%)",
    "step4.payment.deposit_title": "Zaliczka do zapłaty ({pct}%)",
    "step4.payment.btn_full": "Zapłać za zamówienie",
    "step4.payment.btn_deposit": "Wpłać zaliczkę",
    "step4.error.payment_link": "Błąd podczas pobierania linku do płatności.",
    "step4.with_discount": "Z rabatem",
    "step4.total_discount": "Łączna oszczędność",
    "form.error.payment_redirect": "Błąd przekierowania do płatności.",
    "form.success.email_sent": "E-mail został wysłany!",
    "form.error.email_send": "Błąd podczas wysyłania.",

    "success.main_title": "Gotowe!",
    "success.confirmation": "Dziękujemy! Otrzymaliśmy Twoją zaliczkę. Fotobudka jest oficjalnie zarezerwowana.",
    "success.close_notice": "✨ Wszystko gotowe, możesz zamknąć to okno.",

    "loading.quote_generation.title": "Generowanie wyceny...",
    "loading.quote_generation.subtitle": "Dopasowujemy ceny i logistykę...",

    // --- DEVIS / QUOTATION ---
    "axonaut.label.date": "Data",
    "axonaut.label.duration": "Czas trwania",
    "axonaut.label.location": "Miejsce",
    "axonaut.label.day": "dzień",
    "axonaut.label.days": "dni",

    // --- DESCRIPTIONS PRODUITS ---
    "axonaut.desc.cine_base": "Udostępnienie naszej fotobudki z wysokiej klasy sensorem i inteligentną lampą błyskową",
    "axonaut.desc.num_only": "Usługa w 100% cyfrowa (bez papierowych wydruków)",
    "axonaut.desc.prints_1copy": "w 1 egzemplarzu",
    "axonaut.desc.prints_150": "150 natychmiastowych wydruków na błyszczącym papierze fotograficznym Premium Digital 10×15 cm",
    "axonaut.desc.prints_300": "300 natychmiastowych wydruków na błyszczącym papierze fotograficznym Premium Digital 10×15 cm",
    "axonaut.desc.star_base": "Udostępnienie naszej fotobudki <strong>CineBooth Illimité</strong> z wysokiej klasy sensorem 4K i inteligentną lampą błyskową",
    "axonaut.desc.unlimited": "Natychmiastowe wydruki bez limitu na błyszczącym papierze fotograficznym Premium Digital 10×15 cm",
    "axonaut.desc.sig_base": "Udostępnienie naszej fotobudki premium <strong>Signature</strong> z wysokiej klasy lustrzanką, inteligentną lampą błyskową i ekskluzywną obudową",
    "axonaut.desc.sig_multi": "Opcja <strong>{extra} dodatkowe wydruki</strong>: drukuj do {total} zdjęć z każdego ujęcia!",
    "axonaut.desc.360_base": "Udostępnienie naszego <strong>Videobooth 360</strong> z obrotową platformą 120 cm (do 5 osób)",
    "axonaut.desc.360_details": "Natychmiastowe filmy bez limitu: prędkość normalna, przyspieszona i slow motion",
    "axonaut.desc.360_opt": "Personalizacja gratis: dodanie logo lub muzyki",
    "axonaut.desc.360_anim": "3 godziny obsługi w cenie",
    "axonaut.desc.mail_5g": "Natychmiastowa wysyłka zdjęć e-mailem (stałe połączenie 5G)",
    "axonaut.desc.download": "Pobranie zdjęć cyfrowych po wydarzeniu",
    "axonaut.desc.self_setup": "Samodzielny montaż, banalnie prosty, w 2 minuty",
    "axonaut.desc.support": "Pomoc online i wsparcie techniczne",

    // --- LOGISTIQUE ---
    "axonaut.log.title": "Logistyka i dostawa",
    "axonaut.log.pickup": "Odbiór osobisty: 2 rue Victor Carmignac, 94110 Arcueil (Francja)",
    "axonaut.log.sig_setup": "Dostawa, montaż i odbiór przez certyfikowanego technika",
    "axonaut.log.360_setup": "Dostawa, montaż i odbiór",
    "axonaut.log.std_setup": "Dostawa, montaż i odbiór przez naszych kierowców partnerskich",
    "axonaut.log.km": "Dopłata za dojazd: {km} km od centrum Paryża",
    "axonaut.log.hard": "Utrudniona dostawa: trudny dojazd, piętro bez windy lub szczególne ograniczenia logistyczne",

    // --- OPTIONS ---
    "axonaut.opt.template": "[Opcja] Personalizacja szablonu",
    "axonaut.opt.template_free": "(GRATIS)",
    "axonaut.opt.template_desc1": "Zaprojektuj grafikę wokół zdjęcia, w 100% w swoim stylu, całkowicie samodzielnie",
    "axonaut.opt.template_desc2": "Prosty i intuicyjny interfejs online, inspirowany Canvą",
    "axonaut.opt.template_desc3": "Pełna personalizacja: ramki, logo, teksty, kolory itd.",
    "axonaut.opt.template_warn": "Jeśli nie przygotujesz personalizacji do <strong>wieczora przed</strong> wydarzeniem, domyślnie użyjemy eleganckiego szablonu z białą ramką — bez napisów i logo",
    "axonaut.opt.anim": "[Opcja] {h} godz. obsługi na miejscu",
    "axonaut.opt.ia": "[Opcja] Personalizowane tło AI",
    "axonaut.opt.ia_desc": "Tła na miarę generowane przez sztuczną inteligencję",
    "axonaut.opt.rgpd": "[Opcja] Pakiet Zgodność i Zbieranie Danych",
    "axonaut.opt.rgpd_desc": "Konfiguracja ekranu zgody (opt-in) i bezpieczny eksport danych",
    "axonaut.opt.speaker": "[Opcja] Głośnik Bluetooth i muzyka",
    "axonaut.opt.print_sup": "[Opcja] Dopłata za wielokrotne wydruki",

    // --- EMAIL ---
    "axonaut.email.subject": "[Photobooth Paris] Twoje zamówienie czeka 📸",
    "axonaut.email.intro_deposit": "Otrzymaliśmy Twoje zapytanie o wynajem. Aby zagwarantować dostępność sprzętu, wpłać zaliczkę jak najszybciej, online, przez bezpieczny link poniżej. Pozostałą kwotę zapłacisz później, 10 dni przed wydarzeniem.",
    "axonaut.email.intro_full": "Otrzymaliśmy Twoje zapytanie o wynajem. Ponieważ Twoje wydarzenie odbędzie się już wkrótce, aby zagwarantować dostępność sprzętu, wymagana jest <strong>zapłata całej kwoty</strong> jak najszybciej, przez bezpieczny link poniżej.",
    "axonaut.email.body": `
        <div style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px 0;">
            <tr>
            <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <tr>
                    <td style="background-color: #eaeaea; padding: 20px; text-align: center;">
                    <img src="https://www.photobooth-paris.fr/wp-content/uploads/2019/07/logo.png" alt="Photobooth Paris" style="max-width: 150px; height: auto;">
                    </td>
                </tr>
                <tr>
                    <td style="padding: 30px 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                    <h2 style="color: #ff0066; font-size: 22px; margin: 0 0 20px 0; text-align: center; font-weight: bold;">Potwierdź swoją rezerwację!</h2>
                    <p>Dzień dobry,</p>
                    <p>{intro_text}</p>

                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px; margin: 25px 0;">
                        <p style="margin-top: 0; font-weight: bold; color: #ff0066;">Po dokonaniu płatności:</p>
                        <ul style="margin-bottom: 0; padding-left: 20px;">
                        <li style="margin-bottom: 10px;"><strong>Rezerwacja potwierdzona:</strong> Twoje wydarzenie zostaje na stałe wpisane do naszego grafiku.</li>
                        <li style="margin-bottom: 10px;"><strong>Łatwa personalizacja:</strong> Od razu otrzymasz link do zaprojektowania ramki wokół zdjęcia w naszym narzędziu online.</li>
                        <li style="margin-bottom: 0;"><strong>Logistyka na Twoich warunkach:</strong> W kilka kliknięć potwierdzisz terminy dostawy i odbioru dopasowane do Twojej dostępności.</li>
                        </ul>
                    </div>

                    <p style="text-align:center;">
                        <a href="{link}" style="display: inline-block; padding: 16px 30px; background-color: #ff0066; color: #ffffff !important; text-decoration: none; font-weight: bold; border-radius: 50px; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 0, 102, 0.3);">{button_text}</a>
                    </p>

                    <p style="font-size: 13px; color: #666; text-align: center; margin-top: 15px;">⚠️ <em>Dostępność gwarantowana dopiero po otrzymaniu płatności.</em></p>

                    <p style="text-align: center; font-size: 15px; color: #333; margin-top: 30px;">
                        Masz pytanie? Potrzebujesz dodatkowych informacji?<br>Zadzwoń do nas: <strong>+33 1 42 86 54 24</strong> lub po prostu odpowiedz na tego e-maila.
                    </p>

                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">

                    <p style="text-align: center; font-weight: bold; margin-bottom: 10px;">Ulubiona fotobudka firm i klientów prywatnych:</p>
                    <p style="text-align: center; font-size: 14px; color: #555;">
                        <strong>Mama Shelter • Crédit Agricole • Orange • L'Oréal</strong><br>
                        <strong>Wesela • Urodziny • Bar micwy • Wieczory panieńskie</strong><br>
                        ✨ Dołącz do 36 800 uśmiechów uchwyconych w 2025 roku!
                    </p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #e0e0e0;">
                    &copy; {year} Photobooth Paris — Wszelkie prawa zastrzeżone.<br>
                    <a href="https://www.photobooth-paris.fr" style="color: #ff0066; text-decoration: none;">www.photobooth-paris.fr</a>
                    </td>
                </tr>
                </table>
            </td>
            </tr>
        </table>
        </div>`,

    // --- SUCCESS SCREEN (NEXT STEPS) ---
    "success.step1.title": "Potwierdź rezerwację",
    "success.step1.desc": "Wpłać teraz 10% zaliczki, aby zagwarantować dostępność fotobudki.",
    "success.step1.button": "Wpłać zaliczkę (Stripe)",
    "success.step2.title": "Najczęstsze pytania",
    "success.step2.item1.title": "Elastyczny montaż",
    "success.step2.item1.text": "Elastyczna dostawa: dla większego spokoju możliwe przywiezienie dzień wcześniej i odbiór dzień później.",
    "success.step2.item2.title": "Studio kreatywne",
    "success.step2.item2.text": "Po potwierdzeniu rezerwacji otrzymasz dostęp do narzędzia, w którym stworzysz własną ramkę zdjęcia.",
    "success.step2.item3.title": "Elastyczna płatność",
    "success.step2.item3.text": "Przygotowuj się bez stresu. Pozostałą kwotę płacisz dopiero 10 dni przed wydarzeniem.",
    "success.footer.disclaimer": "⚠️ Dostępność gwarantowana dopiero po wpłacie zaliczki.",

    // --- TEXTES AJOUTÉS POUR LE POLONAIS (anciennement codés en dur en français) ---
    "step4.days_suffix": "dni",
    "step4.popup_blocked": "Twoja przeglądarka zablokowała stronę płatności. Zezwól na wyskakujące okienka dla tej strony.",
    "step4.redirecting_payment": "Przekierowanie do bezpiecznej płatności...",
    "address.loading_maps": "Łączenie z Google Maps...",
    "step0.error.not_found": "Nie znaleziono numeru klienta",
    "axonaut.quote.service_prefix": "Usługa",
    "step2.price_per_day": "Cena za dzień",
    "price.suffix.TTC": "brutto",
    "price.suffix.HT": "netto",

    // --- SITES HORS PARIS ---
    "step2.logistics.included_radius": "Dostawa i montaż w cenie do {km} km",
    "step3.company.nip": "NIP",
    "step3.placeholder.nip": "10 cyfr — np. 123-456-32-18",
    "step3.nip.hint": "Opcjonalnie, do faktury.",
    "loading.lead.title": "Wysyłanie zapytania...",
    "loading.lead.subtitle": "Obliczamy cenę...",
    "lead.sent.title": "Zapytanie wysłane!",
    "lead.sent.text": "Sprawdzamy dostępność fotobudki i odezwiemy się w ciągu 24 godzin, aby potwierdzić rezerwację.",
    "lead.next.title": "Co dalej?",
    "lead.next.item1.title": "Potwierdzenie",
    "lead.next.item1.text": "Nasz doradca skontaktuje się z Tobą, aby potwierdzić datę, miejsce i godziny dostawy.",
    "lead.next.item2.title": "Twoja ramka",
    "lead.next.item2.text": "Po potwierdzeniu otrzymasz dostęp do narzędzia, w którym zaprojektujesz własną ramkę zdjęcia.",
    "lead.next.item3.title": "W dniu wydarzenia",
    "lead.next.item3.text": "Dostarczamy i ustawiamy fotobudkę, goście bawią się przez całą imprezę, a my odbieramy ją następnego dnia.",

    // --- BEZ LIMITU GODZIN ---
    "promo.no_time_limit.badge": "Bez limitu godzin · odbiór następnego dnia",
    "promo.no_time_limit.title": "Bez limitu godzin",
    "promo.no_time_limit.text": "Nie wynajmujemy fotobudek na godziny: zostają na całą imprezę — dostarczamy je przed wydarzeniem i odbieramy następnego dnia.",
    "step2.logistics.next_day_pickup": "Odbiór następnego dnia, bez limitu godzin",
    "price.detail.no_time_limit": "Czas: cała impreza, bez limitu godzin",
    "lead.contact": "Masz pytanie? {contact}",
};
