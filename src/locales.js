// src/locales.js

export const locales = {

    // --- TITRES DE LA PAGE ---
    "form.title.default": { fr: "Devis Express Photobooth", en: "Express Photobooth Quote" },
    "form.title.partner": { fr: "Devis Partenaires", en: "Partner Quote" },
    "form.title.calc": { fr: "Bonjour Héloïse et Cédric !", en: "Hello Héloïse and Cédric!" },

    // --- NAVIGATION BARRE ---
    "nav.step1": { fr: "Événement", en: "Event" },
    "nav.step2": { fr: "Configuration", en: "Config" }, // "Config" est souvent mieux que "Configuration" en anglais pour la place
    "nav.step3": { fr: "Contact", en: "Contact" },

    // --- COMMUN ---
    "common.loading": { fr: "Chargement...", en: "Loading..." },
    "common.free": { fr: "Gratuit", en: "Free" },
    "common.included": { fr: "Inclus", en: "Included" },
    "common.between": { fr: "Entre", en: "Between" },
    "common.and": { fr: "et", en: "and" },

    // --- STEP 1: ÉVÉNEMENT ---
    "step1.main_title": {
        fr: "Votre devis en 3 min chrono",
        en: "Get your quote in 3 min chrono"
    },
    "step1.title": { fr: "Quel type d'événement organisez-vous ?", en: "What type of event are you organizing?" },
    "step1.type.placeholder": { fr: "Sélectionnez le type d'événement...", en: "Select event type..." },
    "step1.type.corporate": { fr: "Evénement d'entreprise", en: "Corporate Event" },
    "step1.type.wedding": { fr: "Mariage", en: "Wedding" },
    "step1.type.birthday": { fr: "Anniversaire", en: "Birthday" },
    "step1.type.private": { fr: "Evénement privée", en: "Private event" },
    "step1.type.other": { fr: "Autre", en: "Other" },
    "step1.isPro": { fr: "Je suis une société (prix HT et accès aux options pro)", en: "I am a company (excl. VAT prices & pro options)" },
    "step1.date.label": { fr: "Date de l'événement", en: "Event Date" },
    "step1.duration.label": { fr: "Durée (jours)", en: "Duration (days)" },
    "step1.venue.label": { fr: "Nom du lieu (Hôtel, Restaurant, Particulier...)", en: "Venue Name (Hotel, Restaurant, Private...)" },
    "step1.address.label": { fr: "Adresse complète du lieu", en: "Full delivery address" },
    "step1.address.placeholder": { fr: "Entrez une adresse...", en: "Enter an address..." },
    "step1.venue.placeholder": { fr: "Ex: Pavillon Royal", en: "Ex: The Ritz" },

    // --- STEP 1 ERREURS ---
    "step1.error.past_date": { fr: "La date ne peut pas être dans le passé", en: "Date cannot be in the past" },
    "step1.error.select_address": { fr: "Veuillez sélectionner une adresse dans la liste suggérée", en: "Please select an address from the suggested list" },
    "step1.today.title": { fr: "C'est pour aujourd'hui ?", en: "Is it for today?" },
    "step1.today.subtitle": { fr: "Pour une réservation le jour-même, contactez-nous directement par téléphone pour vérifier la disponibilité immédiate.", en: "For same-day bookings, please contact us directly by phone to check immediate availability." },
    "step1.lastminute.title": { fr: "Réservation de dernière minute", en: "Last-minute booking" },
    "step1.lastminute.desc": { fr: "Votre événement approche à grands pas ! Nous ferons notre maximum pour garantir la disponibilité du matériel choisi.", en: "Your event is fast approaching! We will do our best to ensure the availability of the chosen equipment." },

    // --- STEP 2: CONFIG ---
    "step2.model.selection": { fr: "Modèle sélectionné", en: "Selected model" },
    "step2.modify": { fr: "Modifier", en: "Change" },
    "step2.budget.est": { fr: "Estimation budgétaire", en: "Budget estimate" },
    "step2.delivery.incl": { fr: "(Livraison incluse)", en: "(Delivery included)" },
    "step2.degressive": { fr: "Dégressif dès la 2ème journée", en: "Discounted from the 2nd day" },
    "step2.dynamic_pricing": { fr: "Tarification dynamique selon la période", en: "Dynamic pricing depending on the period" },

    // Header Step 2 (Version Longue restaurée)
    "step2.header.title": { fr: "Choisir Photobooth Paris", en: "Choose Photobooth Paris" },
    "step2.header.desc": {
        fr: "C'est choisir une technologie exclusive, un rendu sans égal. Conçues en France, chacune de nos bornes intègre optique haut de gamme et une imprimante professionnelle. Notre innovation ? Un système propriétaire d'éclairage LED intelligent qui ne s'active que pendant la prise de vue. Résultat : des photos studio parfaites en préservant votre ambiance. La qualité avant tout.",
        en: "It's choosing exclusive technology and unparalleled results. Designed in France, each of our booths integrates high-end optics and a professional printer. Our innovation? A proprietary intelligent LED lighting system that only activates during the shot. Result: perfect studio photos while preserving your ambiance. Quality above all."
    },

    "step2.collection.essential": { fr: "Collection Prêt-à-fêter !", en: "Ready-to-party Collection!" },
    "step2.collection.prestige": { fr: "Collection Prestige", en: "Prestige Collection" },
    "step2.collection.immersive": { fr: "Expérience Immersive", en: "Immersive Experience" },
    "step2.logistics.distance_notice": { fr: "Tarif ajusté selon l'adresse de votre événement", en: "Rate adjusted based on your event location" },
    "step2.logistics.prestige_km": {
        fr: "Votre lieu de réception étant éloigné de Paris, un ajustement logistique de {price}€ s'applique.",
        en: "As your venue is far from Paris, a logistics adjustment of {price}€ applies."
    },
    "step2.logistics.pro_badge_km": { fr: "Livraison de base incluse", en: "Base delivery included" },
    // Badges & Modèles (Descriptions Longues restaurées)
    "step2.badge.pro": { fr: "Pro", en: "Pro" },
    "step2.badge.digital": { fr: "100% digital", en: "100% digital" },
    "step2.badge.150prints": { fr: "150 impressions", en: "150 prints" },
    "step2.badge.unlimited": { fr: "Illimitées", en: "Unlimited" },
    "step2.badge.immersion": { fr: "Immersion", en: "Immersion" },
    "step2.model.digital.tagline": { fr: "L'essentiel 100% Digital", en: "100% Digital Essentials" },

    "step2.model.digital.name": { fr: "CineBooth Digital", en: "Digital CineBooth" },
    "step2.model.digital.tagline": { fr: "L'essentiel 100% Digital", en: "100% Digital Essentials" },
    "step2.model.digital.desc": {
        fr: "Partage illimité par email et SMS. La technologie Ultra HD pour un souvenir moderne, sans aucun tirage papier. Idéal pour communiquer sur les réseaux sociaux.",
        en: "Unlimited sharing via email and SMS. Ultra HD technology for a modern souvenir, without any paper prints. Ideal for communicating on social networks."
    },

    "step2.model.150.name": { fr: "CineBooth 150", en: "CineBooth 150" },
    "step2.model.150.tagline": { fr: "Le choix des particuliers", en: "The private choice" },
    "step2.model.150.desc": {
        fr: "Le pack idéal pour les évènements de moins de 60 personnes. 150 tirages inclus pour que chaque invité reparte avec 2 ou 3 photos !",
        en: "The ideal pack for events with fewer than 60 people. 150 prints included so that each guest leaves with 2 or 3 photos!"
    },

    "step2.model.starbooth.name": { fr: "Starbooth Pro", en: "Starbooth Pro" },
    "step2.model.starbooth.badge": { fr: "Pro", en: "Pro" },
    "step2.model.starbooth.desc": {
        fr: "La performance professionnelle, miniaturisée ! Cette borne est dotée d'un capteur Sony 4K f/1.2, d'un flash LED adaptatif et d'une imprimante thermique poids lourd pour des impressions éclair en illimité.",
        en: "Professional performance, miniaturized! This booth features a Sony 4K f/1.2 sensor, adaptive LED flash, and a heavyweight thermal printer for lightning-fast unlimited prints."
    },

    "step2.model.signature.name": { fr: "Signature", en: "Signature" },
    "step2.model.signature.badge": { fr: "Salon, gala & mariage", en: "Fair, Gala & Wedding" },
    "step2.model.signature.desc": {
        fr: "L'élégance ultime pour vos grands moments. La présence magnétique de cette borne créé l'effervescence autour d'une marque et sublime un lieu de réception. Offrez à vos invités les plaisirs d'une séance photo professionnelle.",
        en: "Ultimate elegance for your grand moments. The magnetic presence of this booth creates excitement around a brand and sublimates a reception venue. Offer your guests the pleasures of a professional photo shoot."
    },

    "step2.model.360.name": { fr: "Vidéobooth 360°", en: "360° Videobooth" },
    "step2.model.360.desc": {
        fr: "Vidéos slow-motion immersives pour 5 personnes. Effet waouh garanti.",
        en: "Immersive slow-motion videos for 5 people. Wow effect guaranteed."
    },
    "step2.model.360.setup_anim_incl": { fr: "livraison et 3h d'animation inclus", en: "delivery and 3h assistance included" },

    // Logistique & Options
    "step2.logistics.title": { fr: "Logistique & Mise en service", en: "Logistics & Setup" },
    "step2.logistics.pro_setup": { fr: "Livraison & Installation par technicien", en: "Delivery & Installation by technician" },
    "step2.logistics.pro_badge": { fr: "Inclus dans votre pack prestige", en: "Included in your prestige pack" },
    "step2.logistics.pickup": { fr: "Retrait à Arcueil (94)", en: "Pick-up in Arcueil (94)" },
    "step2.logistics.delivery": { fr: "Livraison & Installation", en: "Delivery & Installation" },

    "step2.option.template.name": { fr: "Cadre Photo", en: "Photo Frame" },
    "step2.option.template.desc": {
        fr: "Personnalisez le contour de vos photos (logo, date, design...) via notre outil en ligne, importez votre propre fichier ou choisissez parmi notre bibliothèque de modèles.",
        en: "Customize your photo frames (logo, date, design...) via our online tool, import your own file, or choose from our template library."
    },
    "step2.option.template.activate": { fr: "Activer la personnalisation", en: "Activate customization" },
    "step2.option.included_label": { fr: "Option offerte", en: "Gift option" },

    "step2.option.ia.name": { fr: "Fond IA", en: "AI Background" },
    "step2.option.ia.desc": { fr: "L’arrière-plan est détecté par intelligence artificielle et remplacé automatiquement par le décor réaliste de votre choix !", en: "The background is detected by artificial intelligence and automatically replaced by the realistic decor of your choice!" },
    "step2.option.ia.activate": { fr: "Activer le fond magique", en: "Activate magic background" },

    "step2.option.prints.name": { fr: "Impressions par photo", en: "Prints per photo" },
    "step2.option.prints.desc": { fr: "Par défaut, la borne imprime 1 exemplaire par prise de vue. Augmentez le nombre de \"prints\" pour que chaque invité sur la photo reparte avec son souvenir.", en: "By default, the booth prints 1 copy per shot. Increase the number of \"prints\" so that each guest in the photo leaves with their souvenir." },
    "step2.option.prints.1print": { fr: "1 print / photo (Inclus)", en: "1 print / photo (Included)" },
    "step2.option.prints.nprints": { fr: "{n} prints (+{p}€ {s} / jour)", en: "{n} prints (+{p}€ {s} / day)" },

    "step2.option.anim.label": { fr: "Animation sur place", en: "On-site hostess" },
    "step2.option.anim.none": { fr: "Sans animateur (Borne autonome)", en: "No assistant (Self-service)" },
    "step2.option.anim.360_3h": { fr: "3h d'animation (Inclus)", en: "3h assistance (Included)" },
    "step2.option.anim.nh": { fr: "{h}h (+{p}€ {s})", en: "{h}h (+{p}€ {s})" },

    "step2.option.speaker.name": { fr: "Enceinte & Musique", en: "Speaker & Music" },
    "step2.option.speaker.desc": { fr: "Une ambiance musicale pour ambiancer vos invités et booster le fun !", en: "A musical atmosphere to hype up your guests and boost the fun!" },

    "step2.option.rgpd.name": { fr: "Pack Marketing & Data", en: "Marketing & Data Pack" },
    "step2.option.rgpd.desc": { fr: "Transformez vos invités en contacts qualifiés. Collecte d'emails certifiée RGPD pour vos campagnes et export CSV.", en: "Turn your guests into qualified leads. GDPR certified email collection for your campaigns and CSV export." },

    "step2.error.360_multiday": { fr: "Le Videobooth 360° n'est pas disponible pour les locations de plusieurs jours.", en: "The 360 Videobooth is not available for multi-day rentals." },
    "step2.error.anim_multiday": { fr: "Animation non disponible en multi-jours", en: "Assistance not available for multiple days" },

    // --- NAVIGATION ---
    "nav.prev": { fr: "Précédent", en: "Previous" },
    "nav.next": { fr: "Suivant", en: "Next" },
    "nav.generate": { fr: "Générer le devis", en: "Generate Quote" },
    "nav.receiving": { fr: "Calculer mon prix", en: "Calculate my price" },
    "nav.calculating": { fr: "Calcul du prix...", en: "Calculating price..." },
    "nav.submitting": { fr: "Génération...", en: "Generating..." },

    // --- STEP 2 CONFIG (COMPLÉMENTS) ---
    "step2.check.availability": { fr: "Vérification de la disponibilité...", en: "Checking availability..." },
    "step2.check.analysis": { fr: "Analyse pour le {date}...", en: "Analysis for {date}..." },
    "step2.model.price.from": { fr: "Entre", en: "Between" },
    "step2.model.price.to": { fr: "et", en: "and" },
    "price.detail.base": { fr: "Prestation: {name}", en: "Service: {name}" },
    "price.detail.template": { fr: "Outil Template Professionnel", en: "Professional Template Tool" },
    "price.detail.delivery": { fr: "Livraison, installation et reprise", en: "Delivery, setup and collection" },
    "price.detail.km_extra": { fr: "Supplément Kilométrique ({km} km)", en: "Mileage Surcharge ({km} km)" },
    "price.detail.pickup": { fr: "Retrait (Arcueil)", en: "Pick-up (Arcueil)" },
    "price.detail.prints": { fr: "{qty}x supplément d'impression", en: "{qty}x printing supplement" },
    "price.detail.ai_bg": { fr: "Fond IA (personnalisé)", en: "AI Background (custom)" },
    "price.detail.rgpd": { fr: "Conformité RGPD", en: "GDPR Compliance" },
    "price.detail.speaker": { fr: "Enceinte & Musique d'ambiance", en: "Speaker & Ambient Music" },

    // --- STEP 3: CONTACT ---
    "step3.name": { fr: "Prénom & Nom", en: "First & Last Name" },
    "step3.email": { fr: "Adresse email", en: "Email Address" },
    "step3.phone": { fr: "Téléphone", en: "Phone Number" },
    "step3.callback.title": { fr: "Besoin d'aide ?", en: "Need help?" },
    "step3.callback.subtitle": { fr: "J'aimerais être rappelé demain par un conseiller", en: "I'd like a consultant to call me back tomorrow" },
    "step3.billing.title": { fr: "Détails de facturation", en: "Billing Details" },
    "step3.company.name": { fr: "Nom de la société", en: "Company Name" },
    "step3.same.addr": { fr: "L'adresse de facturation est identique au lieu de l'événement", en: "Billing address is the same as the event location" },
    "step3.contact.title": { fr: "Vos Coordonnées", en: "Your Contact Details" },
    "step3.rgpd.notice": {
        fr: "Vos données sont traitées uniquement pour la gestion de votre devis. Conformément au RGPD, vous disposez d'un droit d'accès et de rectification.",
        en: "Your data is processed solely for quote management. In accordance with GDPR, you have the right to access and correct your data."
    },
    // --- NOUVEAUX CHAMPS FACTURATION ---
    "step3.billing.label": { fr: "Adresse de facturation", en: "Billing Address" },
    "step3.billing.btn_same": { fr: "Identique au lieu", en: "Same as venue" },
    "step3.billing.btn_other": { fr: "Une autre adresse", en: "Different address" },
    "step3.billing.sub_other": { fr: "Domicile, Siège social...", en: "Home, Headquarters..." },

    "step3.billing.addr_name": { fr: "Nom de l'adresse", en: "Address Label" },
    "step3.billing.addr_name_ph": { fr: "Ex: Siège Social, Bureau, Domicile...", en: "Ex: HQ, Office, Home..." },

    "step3.billing.search": { fr: "Rechercher l'adresse", en: "Search address" },
    "step3.billing.undefined": { fr: "Adresse non définie", en: "Address not defined" },
    "step3.placeholder.name": { fr: "Jean Dupont", en: "John Doe" },
    "step3.placeholder.company": { fr: "Ma Super Entreprise SAS", en: "My Great Company Ltd" },
    "step3.placeholder.email": { fr: "jean@exemple.com", en: "john@example.com" },
    "step3.placeholder.phone": { fr: "06 12 34 56 78", en: "+44 7911 123456" },

    // --- STEP 4: ECRAN FINAL ---
    "success.title": { fr: "Merci !", en: "Thank you!" },
    "success.subtitle": { fr: "Votre devis a été généré avec succès. Vous pouvez le consulter et le signer en ligne dès maintenant.", en: "Your quote has been successfully generated. You can view and sign it online now." },
    "success.view_quote": { fr: "Voir mon devis", en: "View my quote" },
    "success.send_email": { fr: "M'envoyer le devis par email", en: "Send me the quote by email" },
    "success.email_sent": { fr: "Email envoyé !", en: "Email sent!" },
    "success.new_quote": { fr: "Créer un autre devis", en: "Create another quote" },
    // Ajoutez ces clés (par exemple dans une nouvelle section "step4")
    "step4.notice.full_payment": {
        fr: "Votre événement ayant lieu dans moins de 7 jours, le règlement intégral de la commande est requis pour valider la réservation.",
        en: "Since your event is taking place in less than 7 days, full payment is required to confirm the booking."
    },
    "step4.checking_payment": {
        fr: "Vérification du paiement...",
        en: "Scanning for payment..."
    },
    "step4.title": { fr: "Récapitulatif et Validation", en: "Summary & Validation" },
    "step4.client_details": { fr: "Vos coordonnées", en: "Your Details" },
    "step4.label.contact": { fr: "Contact", en: "Contact" },
    "step4.label.company": { fr: "Société", en: "Company" },
    "step4.label.venue": { fr: "Lieu de l'événement", en: "Event Venue" },
    "step4.label.date": { fr: "Date", en: "Date" },
    "step4.order_title": { fr: "Votre commande", en: "Your Order" },
    "step4.total_ttc": { fr: "Total TTC", en: "Total (incl. VAT)" },
    "step4.balance_notice": { fr: "Le solde sera dû 10 jours avant l'événement", en: "Remaining balance due 10 days before the event" },
    "step4.edit": { fr: "Modifier", en: "Edit" },
    "step4.address_not_specified": { fr: "Adresse non spécifiée.", en: "Address not specified." },
    "step4.payment.full_click": { fr: "Cliquez ici pour régler la totalité", en: "Click here to pay in full" },
    "step4.payment.deposit_click": { fr: "Cliquez ici pour régler l'acompte", en: "Click here to pay the deposit" },
    "step4.payment.full_title": { fr: "Règlement de la commande (100%)", en: "Order Payment (100%)" },
    "step4.payment.deposit_title": { fr: "Acompte à régler ({pct}%)", en: "Deposit to pay ({pct}%)" },
    "step4.payment.btn_full": { fr: "Régler la commande", en: "Pay the order" },
    "step4.payment.btn_deposit": { fr: "Payer l'acompte", en: "Pay the deposit" },
    "step4.error.payment_link": { fr: "Erreur lors de la récupération du lien de paiement.", en: "Error retrieving the payment link." },
    "form.error.payment_redirect": { fr: "Erreur de redirection vers le paiement.", en: "Payment redirection error." },
    "form.success.email_sent": { fr: "Email envoyé avec succès !", en: "Email successfully sent!" },
    "form.error.email_send": { fr: "Erreur lors de l'envoi.", en: "Error during sending." },

    "success.main_title": { fr: "C'est dans la boîte !", en: "Done and dusted!" },
    "success.confirmation": { fr: "Merci ! Votre acompte a bien été reçu. Votre borne est officiellement réservée.", en: "Thank you! Your deposit has been received. Your booth is officially booked." },
    "success.close_notice": { fr: "✨ Tout est en ordre, vous pouvez fermer cette fenêtre.", en: "✨ Everything is set, you can close this window." },

    "loading.quote_generation.title": {
        fr: "Génération de votre devis...",
        en: "Generating your quote..."
    },
    "loading.quote_generation.subtitle": {
        fr: "Ajustement des tarifs et de la logistique en cours...",
        en: "Adjusting pricing and logistics..."
    },

    // --- DEVIS / QUOTATION ---
    // --- LABELS COMMUNS ---
    "axonaut.label.date": { fr: "Date", en: "Date" },
    "axonaut.label.duration": { fr: "Durée", en: "Duration" },
    "axonaut.label.location": { fr: "Lieu", en: "Location" },
    "axonaut.label.day": { fr: "jour", en: "day" },
    "axonaut.label.days": { fr: "jours", en: "days" },

    // --- DESCRIPTIONS PRODUITS ---
    "axonaut.desc.cine_base": {
        fr: "Mise à disposition de notre borne photo avec capteur haute performance et flash intelligent",
        en: "Provision of our photobooth with high-performance sensor and smart flash"
    },
    "axonaut.desc.num_only": {
        fr: "Prestation 100 % numérique (aucun tirage papier)",
        en: "100% digital service (no paper prints)"
    },
    "axonaut.desc.prints_1copy": {
        fr: "en 1 exemplaire",
        en: "1 copy per shot"
    },
    "axonaut.desc.prints_150": {
        fr: "150 impressions instantanées sur papier photo Premium Digital brillant 10×15 cm",
        en: "150 instant prints on Premium Digital glossy 10×15 cm photo paper"
    },
    "axonaut.desc.prints_300": {
        fr: "300 impressions instantanées sur papier photo Premium Digital brillant 10×15 cm",
        en: "300 instant prints on Premium Digital glossy 10×15 cm photo paper"
    },
    "axonaut.desc.star_base": {
        fr: "Mise à disposition de notre borne photo <strong>Starbooth Pro</strong> avec capteur haute performance 4K et flash intelligent",
        en: "Provision of our <strong>Starbooth Pro</strong> photobooth with high-performance 4K sensor and intelligent flash"
    },
    "axonaut.desc.unlimited": {
        fr: "Tirages instantanés et illimités sur papier photo Premium Digital brillant 10×15 cm",
        en: "Unlimited instant prints on Premium Digital glossy 10×15 cm photo paper"
    },
    "axonaut.desc.sig_base": {
        fr: "Mise à disposition de notre borne photo haut de gamme <strong>Signature</strong> avec Reflex haute performance, flash intelligent et habillage premium",
        en: "Provision of our premium <strong>Signature</strong> photobooth with high-performance DSLR, intelligent flash and premium finish"
    },
    "axonaut.desc.sig_multi": {
        fr: "Impression de chaque cliché en <strong>{n} exemplaire(s)</strong>",
        en: "Printing of each shot in <strong>{n} copy/copies</strong>"
    },
    "axonaut.desc.360_base": {
        fr: "Mise à disposition de notre <strong>Videobooth 360</strong> avec plateau rotatif de 120 cm (jusqu'à 5 personnes)",
        en: "Provision of our <strong>360 Videobooth</strong> with 120 cm rotating platform (up to 5 people)"
    },
    "axonaut.desc.360_details": {
        fr: "Vidéos instantanées en illimité : vitesse normale, rapide et slowmotion",
        en: "Unlimited instant videos: normal, fast and slow-motion speeds"
    },
    "axonaut.desc.360_opt": {
        fr: "Personnalisation offerte : ajout d'un logo ou d'une musique",
        en: "Free customization: addition of a logo or music"
    },
    "axonaut.desc.360_anim": {
        fr: "3h d'animation incluses",
        en: "3 hours of on-site assistance included"
    },
    "axonaut.desc.mail_5g": {
        fr: "Envoi instantané des photos par e-mail (connexion 5G permanente)",
        en: "Instant photo delivery via email (permanent 5G connection)"
    },
    "axonaut.desc.download": {
        fr: "Téléchargement des clichés numériques après l'événement",
        en: "Digital photo download after the event"
    },
    "axonaut.desc.self_setup": {
        fr: "Installation par vos soins, ultra-simple en 2 min chrono",
        en: "Self-installation, ultra-simple in 2 minutes flat"
    },
    "axonaut.desc.support": {
        fr: "Assistance digitale et support technique",
        en: "Digital assistance and technical support"
    },

    // --- LOGISTIQUE ---
    "axonaut.log.title": { fr: "Logistique & Livraison", en: "Logistics & Delivery" },
    "axonaut.log.pickup": { fr: "À venir récupérer au 2 rue Victor Carmignac, 94110 Arcueil", en: "To be picked up at 2 rue Victor Carmignac, 94110 Arcueil" },
    "axonaut.log.sig_setup": { fr: "Livraison, installation et reprise par un technicien certifié", en: "Delivery, installation and pickup by a certified technician" },
    "axonaut.log.360_setup": { fr: "Livraison, installation et reprise", en: "Delivery, installation and pickup" },
    "axonaut.log.std_setup": { fr: "Livraison, installation et reprise par nos livreurs partenaires", en: "Delivery, installation and pickup by our delivery partners" },
    "axonaut.log.km": { fr: "Supplément kilométrique : {km} km depuis Paris centre", en: "Kilometric supplement: {km} km from central Paris" },
    "axonaut.log.hard": { fr: "Livraison difficile : accès complexe, étage sans ascenseur, ou contraintes logistiques particulières", en: "Difficult delivery: complex access, floor without elevator, or specific logistical constraints" },

    // --- OPTIONS ---
    "axonaut.opt.template": { fr: "[Option] Personnalisation du template", en: "[Option] Template customization" },
    "axonaut.opt.template_free": { fr: "(OFFERT)", en: "(FREE)" },
    "axonaut.opt.template_desc1": { fr: "Créez votre visuel entourant la photo, 100 % à votre image, en totale autonomie", en: "Create your photo frame layout, 100% to your brand, in total autonomy" },
    "axonaut.opt.template_desc2": { fr: "Interface en ligne simple et intuitive, inspirée de Canva", en: "Simple and intuitive online interface, inspired by Canva" },
    "axonaut.opt.template_desc3": { fr: "Personnalisation complète : cadres, logo, textes, couleurs, etc...", en: "Complete customization: frames, logo, text, colors, etc." },
    "axonaut.opt.template_warn": { fr: "Sans personnalisation de votre part <strong>la veille au soir</strong> de l'événement, un élégant template avec encadré blanc -sans écrit ni logo- sera utilisé par défaut", en: "Without customization by <strong>the night before</strong> the event, an elegant white frame template -without text or logo- will be used by default" },
    "axonaut.opt.anim": { fr: "[Option] {h} heures d'animation sur place", en: "[Option] {h} hours of on-site assistance" },
    "axonaut.opt.ia": { fr: "[Option] Fond IA Personnalisé", en: "[Option] Custom AI Background" },
    "axonaut.opt.ia_desc": { fr: "Création de fonds sur mesure générés par Intelligence Artificielle", en: "Creation of bespoke backgrounds generated by Artificial Intelligence" },
    "axonaut.opt.rgpd": { fr: "[Option] Pack Conformité & Collecte Data", en: "[Option] Compliance & Data Collection Pack" },
    "axonaut.opt.rgpd_desc": { fr: "Mise en place de l'écran de consentement (Opt-in) et export sécurisé des données", en: "Setup of the consent screen (Opt-in) and secure data export" },
    "axonaut.opt.speaker": { fr: "[Option] Enceinte Bluetooth & Musique", en: "[Option] Bluetooth Speaker & Music" },
    "axonaut.opt.print_sup": { fr: "[Option] Supplément Impression Multiple", en: "[Option] Multiple Printing Supplement" },

    // --- EMAIL ---
    "axonaut.email.subject": {
        fr: "[Photobooth Paris] Votre commande vous attends  📸",
        en: "[Photobooth Paris] Your order is waiting for you 📸"
    },

    "axonaut.email.intro_deposit": {
        fr: "Nous avons bien reçu votre demande. Pour bloquer définitivement votre date et la disponibilité du matériel, merci de <strong>régler votre acompte</strong> via le lien sécurisé ci-dessous. Le solde sera dû 10 jours avant votre événement.",
        en: "We have received your request. To officially secure your date and equipment availability, please <strong>pay your deposit</strong> using the secure link below. The remaining balance will be due 10 days before your event."
    },
    "axonaut.email.intro_full": {
        fr: "Nous avons bien reçu votre demande. Votre événement ayant lieu très prochainement, le <strong>règlement intégral de la commande</strong> est requis pour bloquer définitivement votre date et la disponibilité du matériel.",
        en: "We have received your request. Since your event is taking place very soon, <strong>full payment</strong> is required to officially secure your date and equipment availability."
    },
    "axonaut.email.body": {
        fr: `
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
                    <h2 style="color: #ff0066; font-size: 22px; margin: 0 0 20px 0; text-align: center; font-weight: bold;">Votre commande est prête !</h2>
                    <p>Bonjour,</p>
                    <p>{intro_text}</p>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px; margin: 25px 0;">
                        <p style="margin-top: 0; font-weight: bold; color: #ff0066;">Une fois votre paiement validé :</p>
                        <ul style="margin-bottom: 0; padding-left: 20px;">
                        <li style="margin-bottom: 10px;"><strong>Place sécurisée :</strong> Votre événement est définitivement bloqué dans notre planning.</li>
                        <li style="margin-bottom: 10px;"><strong>Espace Design :</strong> Vous recevez immédiatement votre lien pour personnaliser votre cadre photo en ligne.</li>
                        <li style="margin-bottom: 0;"><strong>Logistique simplifiée :</strong> Vous validez vos créneaux de livraison (7 jours sur 7) et de reprise en quelques clics.</li>
                        </ul>
                    </div>

                    <p style="text-align:center;">
                        <a href="{link}" style="display: inline-block; padding: 16px 30px; background-color: #ff0066; color: #ffffff !important; text-decoration: none; font-weight: bold; border-radius: 50px; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 0, 102, 0.3);">{button_text}</a>
                    </p>
                    
                    <p style="font-size: 13px; color: #666; text-align: center; margin-top: 15px;">⚠️ <em>Disponibilité garantie uniquement après réception du paiement.</em></p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="text-align: center; font-weight: bold; margin-bottom: 10px;">Le photobooth préféré des pros et des particuliers :</p>
                    <p style="text-align: center; font-size: 14px; color: #555;">
                        <strong>Mama Shelter • Crédit Agricole • Orange • Mariages</strong><br>
                        ✨ Rejoignez les 36 800 sourires capturés en 2025 !
                    </p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #e0e0e0;">
                    &copy; {year} Photobooth Paris — Tous droits réservés.<br>
                    <a href="https://www.photobooth-paris.fr" style="color: #ff0066; text-decoration: none;">www.photobooth-paris.fr</a>
                    </td>
                </tr>
                </table>
            </td>
            </tr>
        </table>
        </div>`,
        en: `
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
                    <h2 style="color: #ff0066; font-size: 22px; margin: 0 0 20px 0; text-align: center; font-weight: bold;">Your order is ready!</h2>
                    <p>Hello,</p>
                    <p>{intro_text}</p>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px; margin: 25px 0;">
                        <p style="margin-top: 0; font-weight: bold; color: #ff0066;">Once your payment is confirmed:</p>
                        <ul style="margin-bottom: 0; padding-left: 20px;">
                        <li style="margin-bottom: 10px;"><strong>Guaranteed Date:</strong> Your event is officially secured in our calendar.</li>
                        <li style="margin-bottom: 10px;"><strong>Design Studio:</strong> Get instant access to our online tool to create your custom photo template.</li>
                        <li style="margin-bottom: 0;"><strong>Easy Logistics:</strong> Confirm your delivery and pick-up slots based on real-time availability.</li>
                        </ul>
                    </div>

                    <p style="text-align:center;">
                        <a href="{link}" style="display: inline-block; padding: 16px 30px; background-color: #ff0066; color: #ffffff !important; text-decoration: none; font-weight: bold; border-radius: 50px; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 0, 102, 0.3);">{button_text}</a>
                    </p>
                    
                    <p style="font-size: 13px; color: #666; text-align: center; margin-top: 15px;">⚠️ <em>Availability only guaranteed after payment receipt.</em></p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="text-align: center; font-weight: bold; margin-bottom: 10px;">The preferred photobooth for pros and individuals:</p>
                    <p style="text-align: center; font-size: 14px; color: #555;">
                        <strong>Mama Shelter • Crédit Agricole • Orange • Weddings</strong><br>
                        ✨ Join the 36,800 smiles captured in 2025!
                    </p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #e0e0e0;">
                    &copy; {year} Photobooth Paris — All rights reserved.<br>
                    <a href="https://www.photobooth-paris.fr" style="color: #ff0066; text-decoration: none;">www.photobooth-paris.fr</a>
                    </td>
                </tr>
                </table>
            </td>
            </tr>
        </table>
        </div>`
    },

    // --- SUCCESS SCREEN (NEXT STEPS) ---
    "success.step1.title": {
        fr: "Validez votre réservation",
        en: "Confirm your booking"
    },
    "success.step1.desc": {
        fr: "Réglez l'acompte de 10% maintenant pour garantir la disponibilité de votre borne.",
        en: "Pay a 10% deposit now to guarantee availability."
    },
    "success.step1.button": {
        fr: "Payer l'acompte (Stripe)",
        en: "Pay deposit (Stripe)"
    },
    "success.step2.title": {
        fr: "Et après ?",
        en: "What's next?"
    },
    "success.step2.item1.title": { fr: "Installation Flexible", en: "Flexible Setup" },
    "success.step2.item1.text": {
        fr: "Bloquez vos créneaux de livraison. Le petit plus : dépose la veille et reprise le lendemain possible pour plus de sérénité.",
        en: "Schedule your delivery slots. Bonus: early drop-off and late pickup available for total peace of mind."
    },

    "success.step2.item2.title": { fr: "Studio Créatif", en: "Creative Studio" },
    "success.step2.item2.text": {
        fr: "Une fois votre réservation validée, vous recevrez l'accès pour créer votre cadre photo personnalisé à votre image.",
        en: "Once your booking is confirmed, you will receive access to create your custom photo frame."
    },

    "success.step2.item3.title": { fr: "Paiement Flexible", en: "Flexible Payment" },
    "success.step2.item3.text": {
        fr: "Profitez de votre préparation l'esprit libre. Le solde final est à régler seulement 10 jours avant l'événement.",
        en: "Enjoy your prep with peace of mind. The final balance is only due 10 days before the event."
    },
    "success.footer.disclaimer": {
        fr: "⚠️ Disponibilité garantie uniquement après règlement de l'acompte.",
        en: "⚠️ Availability guaranteed only upon receipt of the deposit."
    }
};