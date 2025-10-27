# Városi Kincskereső Mobil Játék

### Megrendelői specifikáció draft

## 1. Bevezetés

### 1.1 Cél

A dokumentum célja a városi kincskereső játék funkcionális és nem funkcionális követelményeinek meghatározása.
Az alkalmazás mobil eszközön elérhető, helyalapú játék, amelyben a felhasználók különböző pontokra menve küldetéseket teljesítenek és pontokat gyűjtenek.

### 1.2 Hatókör (Ez ilyen scope akarna lenni)

A játék célja, hogy a felhasználók valós városi pontokat felkeresve teljesítsenek feladatokat (pl. "menj ide", "járd be az útvonalat"),
és a teljesítéseik alapján toplistán versenyezzenek.
A felhasználók új feladatokat is beküldhetnek, amelyeket adminisztrátorok jóváhagyhatnak.

---

## 2. Rendszeráttekintés

- **Felhasználók:** regisztrált játékosok és adminisztrátorok.
- **Platform:** mobil eszközről elérhető webalkalmazás
- **Architektúra:** kliens-szerver
- **Hitelesítés:** felhasználónév–jelszó alapú bejelentkezés.

---

## 3. Szerepkörök

| Szerep             | Jogosultság                                                                          |
| ------------------ | ------------------------------------------------------------------------------------ |
| **Játékos**        | Saját profil kezelése, feladatok megtekintése és teljesítése, új feladatok javaslása |
| **Adminisztrátor** | Feladatok listázása, jóváhagyása, szerkesztése, felhasználók kezelése                |

---

## 4. Funkcionális követelmények

### 4.1 Felhasználói felület (User Panel)

#### 4.1.1 Regisztráció (Register View)

- Kötelező: felhasználónév, jelszó
- Opcionális: megjelenítendő név (_display name_)
- Duplikált felhasználónév esetén hibaüzenet:
  „A megadott felhasználónév már létezik.”
- Sikeres regisztráció után automatikus bejelentkezés.

#### 4.1.2 Bejelentkezés (Login View)

- Felhasználónév + jelszó ellenőrzése.
- Hibás adatok esetén hibaüzenet.

#### 4.1.3 Térkép nézet (Map View)

- Játékos aktuális pozíciója megjelenik.
- Elérhető feladatpontok kijelölve.
- Ha a felhasználó közel van egy feladathoz -> Kiválasztható és megnyitható feladat.

#### 4.1.4 Feladat nézet (Task View)

- Feladat címe, leírása, pontértéke, helyszíne.
- „Teljesítés indítása” gomb.
- A rendszer GPS alapján ellenőrzi, hogy a játékos a helyszínen van-e.
- Siker esetén pontok hozzáadása a profilhoz.

#### 4.1.5 Elérhető feladatok (Available Task View)

- Egy összesített lista az összes jóváhagyott, elérhető feladatról.
- Szűrés nehézség, távolság szerint.
- Feladat javaslása gomb.

#### 4.1.6 Saját feladat létrehozása (List My & Create Task View)

- Feladat adatai: cím, leírás, koordináták, pontérték, típus.
- Beküldés után státusz: _pending approval_.
- Adminisztrátor jóváhagyása után válik elérhetővé.

#### 4.1.7 Profil nézet (Profile View)

- Felhasználónév, display név, összes pont.
- Teljesített feladatok listája.

#### 4.1.8 Toplista nézet (Score View)

- Játékosok összesített pontszámai.
- Részletes bontás megnyitható (pl. teljesített feladatok listája).

---

### 4.2 Admin Panel

#### 4.2.1 Feladatkezelés

- Feladatok listázása (jóváhagyott, függő, elutasított).
- Szerkesztés, jóváhagyás, törlés.
- Felhasználó által beküldött javaslatok áttekintése.

#### 4.2.2 Felhasználókezelés

- Felhasználók listázása.
- Felhasználói szerepkör módosítása (admin/user).
- Fiók törlése.

---

## 5. Feladattípusok

| Típus                                     | Leírás                                                                           |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| **Menj oda (Go There)**                   | A játékosnak el kell jutnia egy adott helyre.                                    |
| **Több helyszín sorrendben (Multi-step)** | Több pontot kell meghatározott sorrendben meglátogatni.                          |
| **Maradj az útvonalon (Stay on Track)**   | A játékosnak egy kijelölt útvonalon kell haladnia, a rendszer figyeli a mozgást. |

---

## 6. User Story-k

| ID        | User Story                                                                          | Elfogadási kritériumok                                                                                                                          |
| --------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **US-01** | Mint játékos, szeretnék regisztrálni, hogy részt vehessek a játékban.               | A rendszer elutasítja a regisztrációt, ha a felhasználónév már létezik. Sikeres regisztráció után bejelentkezett állapotba kerül a felhasználó. |
| **US-02** | Mint játékos, szeretnék bejelentkezni a fiókomba.                                   | Csak érvényes felhasználónév-jelszó páros enged bejelentkezni. Hibás adatok esetén hibaüzenet jelenik meg.                                      |
| **US-03** | Mint játékos, szeretném látni a környékemen lévő feladatokat térképen.              | A rendszer térképen jeleníti meg az elérhető feladatpontokat a GPS alapján.                                                                     |
| **US-04** | Mint játékos, szeretném elindítani a kiválasztott feladatot.                        | A rendszer ellenőrzi, hogy a játékos fizikailag a feladat helyszínén tartózkodik-e, és ennek megfelelően engedélyezi a teljesítést.             |
| **US-05** | Mint játékos, szeretném megkapni a pontjaimat sikeres teljesítés után.              | Feladat teljesítésekor a rendszer hozzáadja a pontokat a felhasználó összesített eredményéhez.                                                  |
| **US-06** | Mint játékos, szeretnék új feladatot beküldeni.                                     | A beküldött feladat státusza _pending approval_ lesz, és csak admin jóváhagyása után jelenik meg.                                               |
| **US-07** | Mint adminisztrátor, szeretném jóváhagyni vagy elutasítani a beküldött feladatokat. | Az admin felület listázza a beküldött feladatokat, és lehetőséget ad jóváhagyásra vagy elutasításra.                                            |
| **US-08** | Mint adminisztrátor, szeretném kezelni a felhasználókat.                            | Az admin módosíthatja a felhasználó szerepét és törölheti a fiókot.                                                                             |
| **US-09** | Mint játékos, szeretném látni a toplistát.                                          | A toplistán megjelennek az összes játékos összesített pontszámai.                                                                               |
| **US-10** | Mint játékos, nem szeretnék kétszer ugyanazzal a felhasználónévvel regisztrálni.    | A rendszer ellenőrzi, hogy a felhasználónév egyedi legyen.                                                                                      |

---

## 7. Elfogadási és működési kritériumok

| Kód       | Kritérium             | Leírás                                                                                  |
| --------- | --------------------- | --------------------------------------------------------------------------------------- |
| **AC-01** | Egyedi felhasználónév | Duplikált username esetén a regisztráció sikertelen.                                    |
| **AC-02** | Helyzetellenőrzés     | Feladat csak akkor teljesíthető, ha a játékos a megadott koordinátán belül tartózkodik. |
| **AC-03** | Pontkezelés           | A rendszer pontot ad a sikeres feladatokért, és naplózza a teljesítést.                 |
| **AC-04** | Jogosultságkezelés    | Csak admin végezhet jóváhagyást, törlést és szerkesztést.                               |
| **AC-05** | Feladat jóváhagyás    | Beküldött feladat _pending_ állapotban marad, amíg admin nem dönt róla.                 |
| **AC-06** | Hibakezelés           | Hibás hitelesítési vagy adatbevitel esetén felhasználóbarát üzenet jelenik meg.         |
| **AC-07** | Toplista frissítés    | Teljesítés után a toplista automatikusan frissül.                                       |

---

## 8. Technológiai specifikáció

| Komponens    | Technológia                            |
| ------------ | -------------------------------------- |
| Frontend     | vue3 + tailwindcss                     |
| Backend      | NestJS                                 |
| Adatbázis    | PostgreSQL                             |
| API formátum | REST (JSON)                            |
| Térkép       | OpenStreetMap + Leaflet                |
| Hitelesítés  | Alap jelszó-ellenőrzés (bcrypt hash)   |

---

## 9. Nem funkcionális követelmények

- **Stabilitás:** szerverhibák kezelése, visszajelzés a kliens felé.
- **Reszponzív megjelenés:** mobil támogatás.
- **Egyszerű UI:** minimális kattintás, gyors hozzáférés a funkciókhoz.
