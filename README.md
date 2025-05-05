<p align="center">
  <img src="https://github.com/user-attachments/assets/a6a79fee-235a-4cb9-8943-aab094d68866" />
  <h1 align="center">
    Software pro správu Projektových dnů
  </h1>
</p>

Modulární software vyvinut pro Přednáškový den Studentské rady 2025. Výrazně usnadňuje a urychluje organizaci celoškolních akcí.

### Dostupné funkce

1. Distribuce anotací přednášek
2. Předběžný průzkum zájmu (volitelné)
3. Portál pro volbu přednášek
4. Automatické rozřazení nerozhodnutých účastníků
5. Automatické generování prezenčních listin
6. Komplexní administrátorské nástroje
7. Real-time harmonogram pro den akce

## Slovníček

### Blok (`Block`)

Časový interval, ve kterém se odehrávají jednotlivé přednášky. Akce je tvořena z jednoho či více bloků.

### Typ přednášky (`Archetype`)

Prototyp přednášky jenž určuje její jméno a popis.

### Místnost (`Place`)

Místnost, ve kterém se může odehrávat přednáška. V dané místnosti se může v jednom bloku odehrávat vždy maximálně jedna událost.

### Přednáška (`Event`)

Přednáška má vždy typ, místnost, ve které se odehrává, kapacitu a může mít přiřazené učitele.

### Přihlášení na přednášku (`Claim`)

Pokud je právě otevřené přihlašování na přednášky, mohou si účastníci volit, na kterou přednášku chtějí jít. Volí si vždy na každý blok jeden primární typ přednášky a pokud je nastaveno, tak i jeden sekundární. Primární přihlášky podléhají kapacitnímu omezení součtu kapacit přednášek daného typu v daném bloku. Sekundární přednášky tomuto omezení nepodléhají, aby bylo možno vždy zvolit alespoň něco. Toto může v krajním případě zapříčinit přetečení přednášek v případě zrušení silně exponovaného typu přednášky a nešťastného rozložení sekundárních přihlášek.

> [!NOTE]  
> V okamžiku, kdy jsou už vygenerované přiřazení na přednášku ztrácí jakýkoliv praktický význam, kromě nouzové zálohy a jejich změna se již neprojeví na přiřazení.

### Přiřazení na přednášku (`Attendance`)

Generováno algoritmem na základě přihlášek odevzdaných účastníky. Do rozřazení se zahrnuje primárně preference účastníků, ale dále kapacita učeben a v případě nerozhodnutých účastníků i naplněnost jednotlivých typů v daných blocích.

> [!CAUTION]
> Spuštění rozřazovacího algoritmu _trvale_ smaže všechny stávající rozřazení a vygeneruje nové. I když je algoritmus jako takový deterministický (pro stejný vstup generuje stejný výstup) i velmi mírné změny ve vstupních parametrech (1 člověk se odhlásí) mohou vést k úplně jiných výsledkům. Proto se doporučuje tento algoritmus spouštět pouze jednou a to až v okamžiku, kdy je jisté, že nebude docházet ke větším změnám (ideálně v předvečer akce) a následně případné změny řešit manuálně.

## Hosting

1.  Naklonujte toto repo

    ```bash
    git clone https://github.com/StudentskaRadaGH/ProjektovyDen
    ```

2.  Nainstalujte potřebné knihovny

    ```bash
    pnpm install
    ```

3.  Nastavte konfiguraci v `configuration/configuration.ts`
    (template v `configuration/configuration.example.ts`)

    ```typescript
    {
        appName: "Přednáškový den",
        appShortName: "Přednáškový den",
        appDescription: "Aplikace SRGH pro usnadnění organizace Přednáškového dne",
        appThemeColor: "#001c2e",
        SRGHBranding: true, // Jedná se o akci SRGH

        attendanceSheetFooter: "Přednáškový den Studentské rady GH, 2025", // Text, který se objeví na prezenční listině na spodní části stránky

        initialAdmins: [ // Maily uživatelů, kteří automaticky dostanou přiřazenu roli administrátora
            "kostkaj@gytool.cz"
        ],

        collectInterest: true, // Předběžný průzkum zájmu
        maxInterests: 2, // Maximální počet zájmů na uživatele
        interestsCTA:
            "U až dvou přednášek máte možnost vyjádřit svůj předběžný (nezávazný) zájem. Tím nám pomůžete správně naplánovat kapacitu místností a přispějete plynulosti akce.",

        collectAttendance: false, // Not implemented

        openClaimsOn: new Date("2025-01-27T17:00:00Z"), // UTC datum a čas začátku přihlašování do dílen
        closeClaimsOn: new Date("2025-01-28T09:00:00Z"), // UTC datum a čas konce přihlašování do dílen
        secondaryClaims: true, // Kromě primárních přednášek i sekundární přednášky

        validClasses: [
            "I.A4",
            "I.B4",
            "II.A4",
            "II.B4",
            // ...
        ], // Třídy, pro které je akce zamýšlena - ÚČASTNÍCI SAMI VOLÍ SVOU TŘÍDU!
    }
    ```

4.  Nastavte ikonu aplikace `configuration/icon.tsx`
    Můžete využít `configuration/icon.example.tsx` - Pokud používáte svojí, aktualizujte i příslušné soubory:

    - `app/icon.png`
    - `app/icon-apple.png`

5.  Vytvořte .env v hlavním adresáři

    ```dotenv
    BASE_URL="http://localhost:3000"
    DATABASE_URL="postgres://user:password@example.com:port/database"
    AUTH_SECRET="secret"
    AUTH_CALLBACK_URL="http://localhost:3000/api/auth/callback"
    MICROSOFT_CLIENT_ID="ac16f486-4515-4f8f-b941-4b4521b0aa21"
    MICROSOFT_CLIENT_SECRET="uuid"
    MICROSOFT_TENANT_ID="d2a20c68-200c-40fa-be20-86101df00e2f"
    ```

> [!TIP] > **Base_URL:** Adresa, kde je systém hostován\
> **DATABASE_URL:** URL postgres databáze\
> **AUTH_SECRET:** Secret používaný pro podepisování autentizačních tokenů\
> **AUTH_CALLBACK_URL:** Adresa, nastavená v Microsoft Entra ID, kam jsou uživatelé přesměrování po přihlášení (https://portal.azure.com -> Entra ID -> App registrations -> Manage -> Authentication -> Web -> Redirect URIs)\
> **MICROSOFT_CLIENT_ID:** https://portal.azure.com -> Entra ID -> App registrations -> Overview -> Application (client) ID\
> **MICROSOFT_CLIENT_SECRET:** https://portal.azure.com -> Entra ID -> App registrations -> Manage -> Certificates & secrets -> Client secrets -> Value\
> **MICROSOFT_TENANT_ID:** https://portal.azure.com -> Entra ID -> App registrations -> Overview -> Directory (tenant) ID

6.  Vytvořte strukturu databáze

    ```bash
    pnpm migrate
    ```

7.  Zkompilujte aplikaci

    ```bash
    pnpm build
    ```

8.  Spusťte server

    ```bash
    pnpm start
    ```

> [!TIP]
> (Pro trvalý hosting doporučuji pm2)
>
> ```bash
>  pm2 start npm --name "projektovy-den" -- start -- --port 3000
> ```
>
> ```bash
> pm2 startup
> pm2 save
> ```

<p align="right">
  - By <a href="https://github.com/K0stka">K0stka</a>, Studentská rada GH, 2025
</p>
