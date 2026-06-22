// ================================================================
// Alboomy — Verified Panini FIFA World Cup 2026 Sticker Data
// Source: scanini.app, cross-referenced with official Panini album
// Total: 980 stickers (20 front section + 48×20 teams + 11 museum)
// ================================================================

// Helper: build 20 stickers for a team
function ts(code, name, flag, players) {
  const s = [{ id: `${code}1`, label: 'Team Logo', foil: true, code, team: name, flag }]
  for (let i = 0; i < 11; i++) s.push({ id: `${code}${i + 2}`, label: players[i], foil: false, code, team: name, flag })
  s.push({ id: `${code}13`, label: 'Team Photo', foil: false, code, team: name, flag })
  for (let i = 11; i < 18; i++) s.push({ id: `${code}${i + 3}`, label: players[i], foil: false, code, team: name, flag })
  return s
}

// ── Special sections ─────────────────────────────────────────────
// Matches physical album order:
// intro (Panini logo + FWC1-8) → 48 teams → museum (FWC9-19)

export const SPECIAL_SECTIONS = {
  intro: {
    key: 'intro',
    title: 'Introduction',
    stickers: [
      { id: '00',   label: 'We Are Panini',                    foil: true, code: 'FWC', team: 'Introduction', flag: '⭐' },
      { id: 'FWC1', label: 'Official Emblem',                  foil: true, code: 'FWC', team: 'Introduction', flag: '🏆' },
      { id: 'FWC2', label: 'Official Emblem',                  foil: true, code: 'FWC', team: 'Introduction', flag: '🏆' },
      { id: 'FWC3', label: 'Official Mascots',                 foil: true, code: 'FWC', team: 'Introduction', flag: '🏆' },
      { id: 'FWC4', label: 'Official Slogan',                  foil: true, code: 'FWC', team: 'Introduction', flag: '🏆' },
      { id: 'FWC5', label: 'Official Ball',                    foil: true, code: 'FWC', team: 'Introduction', flag: '🏆' },
      { id: 'FWC6', label: 'Canada — Host Countries & Cities', foil: true, code: 'FWC', team: 'Introduction', flag: '🏆' },
      { id: 'FWC7', label: 'Mexico — Host Countries & Cities', foil: true, code: 'FWC', team: 'Introduction', flag: '🏆' },
      { id: 'FWC8', label: 'USA — Host Countries & Cities',    foil: true, code: 'FWC', team: 'Introduction', flag: '🏆' },
    ],
  },
  museum: {
    key: 'museum',
    title: 'FIFA Museum',
    stickers: [
      { id: 'FWC9',  label: 'Italy 1934 — World Cup History',        foil: true, code: 'FWC', team: 'FIFA Museum', flag: '🏛️' },
      { id: 'FWC10', label: 'Uruguay 1950 — World Cup History',      foil: true, code: 'FWC', team: 'FIFA Museum', flag: '🏛️' },
      { id: 'FWC11', label: 'West Germany 1954 — World Cup History', foil: true, code: 'FWC', team: 'FIFA Museum', flag: '🏛️' },
      { id: 'FWC12', label: 'Brazil 1962 — World Cup History',       foil: true, code: 'FWC', team: 'FIFA Museum', flag: '🏛️' },
      { id: 'FWC13', label: 'West Germany 1974 — World Cup History', foil: true, code: 'FWC', team: 'FIFA Museum', flag: '🏛️' },
      { id: 'FWC14', label: 'Argentina 1986 — World Cup History',    foil: true, code: 'FWC', team: 'FIFA Museum', flag: '🏛️' },
      { id: 'FWC15', label: 'Brazil 1994 — World Cup History',       foil: true, code: 'FWC', team: 'FIFA Museum', flag: '🏛️' },
      { id: 'FWC16', label: 'Brazil 2002 — World Cup History',       foil: true, code: 'FWC', team: 'FIFA Museum', flag: '🏛️' },
      { id: 'FWC17', label: 'Italy 2006 — World Cup History',        foil: true, code: 'FWC', team: 'FIFA Museum', flag: '🏛️' },
      { id: 'FWC18', label: 'Germany 2014 — World Cup History',      foil: true, code: 'FWC', team: 'FIFA Museum', flag: '🏛️' },
      { id: 'FWC19', label: 'Argentina 2022 — World Cup History',    foil: true, code: 'FWC', team: 'FIFA Museum', flag: '🏛️' },
    ],
  },
}

// ── Teams (in album order) ────────────────────────────────────────
export const TEAMS = [
  { code: 'MEX', name: 'Mexico',       flag: '🇲🇽', stickers: ts('MEX','Mexico','🇲🇽',['Luis Malagón','Johan Vasquez','Jorge Sánchez','Cesar Montes','Jesus Gallardo','Israel Reyes','Diego Lainez','Carlos Rodriguez','Edson Alvarez','Orbelin Pineda','Marcel Ruiz','Érick Sánchez','Hirving Lozano','Santiago Giménez','Raúl Jiménez','Alexis Vega','Roberto Alvarado','Cesar Huerta']) },
  { code: 'RSA', name: 'South Africa', flag: '🇿🇦', stickers: ts('RSA','South Africa','🇿🇦',['Ronwen Williams','Sipho Chaine','Aubrey Modiba','Samukele Kabini','Mbekezeli Mbokazi','Khulumani Ndamane','Siyabonga Ngezana','Khuliso Mudau','Nkosinathi Sibisi','Teboho Mokoena','Thalente Mbatha','Bathasi Aubaas','Yaya Sithole','Sipho Mbule','Lyle Foster','Iqraam Rayners','Mohau Nkota','Oswin Appollis']) },
  { code: 'KOR', name: 'Korea Republic', flag: '🇰🇷', stickers: ts('KOR','Korea Republic','🇰🇷',['Hyeon-woo Jo','Seung-Gyu Kim','Min-jae Kim','Yu-min Cho','Young-woo Seol','Han-beom Lee','Tae-seok Lee','Myung-jae Lee','Jae-sung Lee','In-beom Hwang','Kang-in Lee','Seung-ho Paik','Jens Castrop','Dongg-yeong Lee','Gue-sung Cho','Heung-min Son','Hee-chan Hwang','Hyeon-Gyu Oh']) },
  { code: 'CZE', name: 'Czechia',      flag: '🇨🇿', stickers: ts('CZE','Czechia','🇨🇿',['Matej Kovar','Jindrich Stanek','Ladislav Krejci','Vladimir Coufal','Jaroslav Zeleny','Tomas Holes','David Zima','Michal Sadilek','Lukas Provod','Lukas Cerv','Tomas Soucek','Pavel Sulc','Matej Vydra','Vasil Kusej','Tomas Chory','Vaclav Cerny','Adam Hlozek','Patrik Schick']) },
  { code: 'CAN', name: 'Canada',       flag: '🇨🇦', stickers: ts('CAN','Canada','🇨🇦',['Dayne St.Clair','Alphonso Davies','Alistair Johnston','Samuel Adekugbe','Riche Larvea','Derek Cornelius','Moïse Bombito','Kamal Miller','Stephen Eustáquio','Ismaël Koné','Jonathan Osorio','Jacob Shaffelburg','Mathieu Choinière','Niko Sigur','Tajon Buchanan','Liam Millar','Cyle Larin','Jonathan David']) },
  { code: 'BIH', name: 'Bosnia and Herzegovina', flag: '🇧🇦', stickers: ts('BIH','Bosnia and Herzegovina','🇧🇦',['Nikola Vasilj','Amer Dedic','Sead Kolasinac','Tarik Muharemovic','Nihad Mujakic','Nikola Katic','Amir Hadziahmetovic','Benjamin Tahirovic','Armin Gigovic','Ivan Sunjic','Ivan Basic','Dzenis Burnic','Esmir Bajraktarevic','Amar Memic','Ermedin Demirovic','Edin Dzeko','Samed Bazdar','Haris Tabakovic']) },
  { code: 'QAT', name: 'Qatar',        flag: '🇶🇦', stickers: ts('QAT','Qatar','🇶🇦',['Meshaal Barsham','Sultan Albrake','Lucas Mendes','Homam Ahmed','Boualem Khoukhi','Pedro Miguel','Tarek Salman','Mohamed Al-Mannai','Karim Boudiaf','Assim Madibo','Ahmed Fatehi','Mohammed Waad','Abdulaziz Hatem','Hassan Al-Haydos','Edmilson Junior','Akram Hassan Afif','Ahmed Al Ganehi','Almoez Ali']) },
  { code: 'SUI', name: 'Switzerland',  flag: '🇨🇭', stickers: ts('SUI','Switzerland','🇨🇭',['Gregor Kobel','Yvon Mvogo','Manuel Akanji','Ricardo Rodriguez','Nico Elvedi','Aurèle Amenda','Silvan Widmer','Granit Xhaka','Denis Zakaria','Remo Freuler','Fabian Rieder','Ardon Jashari','Johan Manzambi','Michel Aebischer','Breel Embolo','Ruben Vargas','Dan Ndoye','Zeki Amdouni']) },
  { code: 'BRA', name: 'Brazil',       flag: '🇧🇷', stickers: ts('BRA','Brazil','🇧🇷',['Alisson','Bento','Marquinhos','Éder Militão','Gabriel Magalhães','Danilo','Wesley','Lucas Paquetá','Casemiro','Bruno Guimarães','Luiz Henrique','Vinicius Júnior','Rodrygo','João Pedro','Matheus Cunha','Gabriel Martinelli','Raphinha','Estévão']) },
  { code: 'MAR', name: 'Morocco',      flag: '🇲🇦', stickers: ts('MAR','Morocco','🇲🇦',['Yassine Bounou','Munir El Kajoui','Achraf Hakimi','Noussair Mazraoui','Nayef Aguerd','Roman Saiss','Jawad El Yamio','Adam Masina','Sofyan Amrabat','Azzedine Ounahi','Eliesse Ben Seghir','Bilal El Khannouss','Ismael Saibari','Youssef En-Nesyri','Abde Ezzalzouli','Soufiane Rahimi','Brahim Diaz','Ayoub El Kaabi']) },
  { code: 'HAI', name: 'Haiti',        flag: '🇭🇹', stickers: ts('HAI','Haiti','🇭🇹',['Johny Placide','Carlens Arcus','Martin Expérience','Jean-Kevin Duverne','Ricardo Adé','Duke Lacroix','Garven Metusala','Hannes Delcroix','Leverton Pierre','Danley Jean Jacques','Jean-Ricner Bellegarde','Christopher Attys','Derrick Etienne Jr','Josue Casimir','Ruben Providence','Duckens Nazon','Louicius Deedson','Frantzdy Pierrot']) },
  { code: 'SCO', name: 'Scotland',     flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', stickers: ts('SCO','Scotland','🏴󠁧󠁢󠁳󠁣󠁴󠁿',['Angus Gunn','Jack Hendry','Kieran Tierney','Aaron Hickey','Andrew Robertson','Scott McKenna','John Souttar','Anthony Ralston','Grant Hanley','Scott McTominay','Billy Gilmour','Lewis Ferguson','Ryan Christie','Kenny McLean','John McGinn','Lyndon Dykes','Che Adams','Ben Gannon-Doak']) },
  { code: 'USA', name: 'United States', flag: '🇺🇸', stickers: ts('USA','United States','🇺🇸',['Math Freese','Chris Richards','Tim Ream','Mark McKenzie','Alex Freeman','Antonee Robinson','Tyler Adams','Tanner Tessmann','Weston McKenny','Christian Roldan','Timothy Weah','Diego Luna','Malik Tillman','Christian Pulisic','Brenden Aaronson','Ricardo Pepi','Haji Wright','Folarin Balogun']) },
  { code: 'PAR', name: 'Paraguay',     flag: '🇵🇾', stickers: ts('PAR','Paraguay','🇵🇾',['Roberto Fernandez','Orlando Gill','Gustavo Gomez','Fabián Balbuena','Juan José Cáceres','Omar Alderete','Junior Alonso','Mathías Villasanti','Diego Gomez','Damián Bobadilla','Andres Cubas','Matias Galarza Fonda','Julio Enciso','Alejandro Romero Gamarra','Miguel Almirón','Ramon Sosa','Angel Romero','Antonio Sanabria']) },
  { code: 'AUS', name: 'Australia',    flag: '🇦🇺', stickers: ts('AUS','Australia','🇦🇺',['Mathew Ryan','Joe Gauci','Harry Souttar','Alessandro Circati','Jordan Bos','Aziz Behich','Cameron Burgess','Lewis Miller','Milos Degenek','Jackson Irvine','Riley McGree','Aiden O\'Neill','Connor Metcalfe','Patrick Yazbek','Craig Goodwin','Kusini Vengi','Nestory Irankunda','Mohamed Touré']) },
  { code: 'TUR', name: 'Turkey',       flag: '🇹🇷', stickers: ts('TUR','Turkey','🇹🇷',['Ugurcan Cakir','Mert Muldur','Zeki Celik','Abdulkerim Bardakci','Caglar Soyuncu','Merih Demiral','Ferdi Kadioglu','Kaan Ayhan','Ismail Yuksek','Hakan Calhanoglu','Orkun Kokcu','Arda Guler','Irfan Can Kahveci','Yunus Akgun','Can Uzun','Baris Alper Yilmaz','Kerem Akturkoglu','Kenan Yildiz']) },
  { code: 'GER', name: 'Germany',      flag: '🇩🇪', stickers: ts('GER','Germany','🇩🇪',['Marc-André ter Stegen','Jonathan Tah','David Raum','Nico Schlotterbeck','Antonio Rüdiger','Waldemar Anton','Ridle Baku','Maximilian Mittelstadt','Joshua Kimmich','Florian Wirtz','Felix Nmecha','Leon Goretzka','Jamal Musiala','Serge Gnabry','Kai Havertz','Leroy Sane','Karim Adeyemi','Nick Woltemade']) },
  { code: 'CUW', name: 'Curaçao',     flag: '🇨🇼', stickers: ts('CUW','Curaçao','🇨🇼',['Eloy Room','Armando Obispo','Sherel Floranus','Jurien Gaari','Joshua Brenet','Roshon Van Eijma','Shurandy Sambo','Livano Comenencia','Godfried Roemeratoe','Juninho Bacuna','Leandro Bacuna','Tahith Chong','Kenji Gorre','Jearl Margaritha','Jurgen Locadia','Jeremy Antonisse','Gervane Kastaneer','Sontje Hansen']) },
  { code: 'CIV', name: 'Ivory Coast', flag: '🇨🇮', stickers: ts('CIV','Ivory Coast','🇨🇮',['Yahia Fofana','Ghislain Konan','Wilfried Singo','Odilon Kossounou','Evan Ndicka','Willy Boly','Emmanuel Agbadou','Ousmane Diomande','Franck Kessie','Seko Fofana','Ibrahim Sangare','Jean-Philippe Gbamin','Amad Diallo','Sébastien Haller','Simon Adingra','Yan Diomande','Evann Guessand','Oumar Diakite']) },
  { code: 'ECU', name: 'Ecuador',      flag: '🇪🇨', stickers: ts('ECU','Ecuador','🇪🇨',['Hernán Galíndez','Gonzalo Valle','Piero Hincapié','Pervis Estupiñán','Willian Pacho','Ángelo Preciado','Joel Ordóñez','Moises Caicedo','Alan Franco','Kendry Paez','Pedro Vite','John Veboah','Leonardo Campana','Gonzalo Plata','Nilson Angulo','Alan Minda','Kevin Rodriguez','Enner Valencia']) },
  { code: 'NED', name: 'Netherlands',  flag: '🇳🇱', stickers: ts('NED','Netherlands','🇳🇱',['Bart Verbruggen','Virgil van Dijk','Micky van de Ven','Jurrien Timber','Denzel Dumfries','Nathan Aké','Jeremie Frimpong','Jan Paul van Hecke','Tijjani Reijnders','Ryan Gravenberch','Teun Koopmeiners','Frenkie de Jong','Xavi Simons','Justin Kluivert','Memphis Depay','Donyell Malen','Wout Weghorst','Cody Gakpo']) },
  { code: 'JPN', name: 'Japan',        flag: '🇯🇵', stickers: ts('JPN','Japan','🇯🇵',['Zion Suzuki','Henry Heroki Mochizuki','Ayumu Seko','Junnosuke Suzuki','Shogo Taniguchi','Tsuyoshi Watanabe','Kaishu Sano','Yuki Soma','Ao Tanaka','Daichi Kamada','Takefusa Kubo','Ritsu Doan','Keito Nakamura','Takumi Minamino','Shuto Machino','Junya Ito','Koki Ogawa','Ayase Ueda']) },
  { code: 'SWE', name: 'Sweden',       flag: '🇸🇪', stickers: ts('SWE','Sweden','🇸🇪',['Victor Johansson','Isak Hien','Gabriel Gudmundsson','Emil Holm','Victor Nilsson Lindelöf','Gustaf Lagerbielke','Lucas Bergvall','Hugo Larsson','Jesper Karlström','Yasin Ayari','Mattias Svanberg','Daniel Svensson','Ken Sema','Roony Bardghji','Dejan Kulusevski','Anthony Elanga','Alexander Isak','Viktor Gyökeres']) },
  { code: 'TUN', name: 'Tunisia',      flag: '🇹🇳', stickers: ts('TUN','Tunisia','🇹🇳',['Bechir Ben Said','Aymen Dahmen','Yan Valery','Montassar Talbi','Yassine Meriah','Ali Abdi','Dylan Bronn','Ellyes Skhiri','Aissa Laidouni','Ferjani Sassi','Mohamed Ali Ben Romdhane','Hannibal Mejbri','Elias Achouri','Elias Saad','Hazem Mastouri','Ismael Gharbi','Sayfallah Ltaief','Naim Sliti']) },
  { code: 'BEL', name: 'Belgium',      flag: '🇧🇪', stickers: ts('BEL','Belgium','🇧🇪',['Thibaut Courtois','Arthur Theate','Timothy Castagne','Zeno Debast','Brandon Mechele','Maxim De Cuyper','Thomas Meunier','Youri Tielemans','Amadou Onana','Nicolas Raskin','Alexis Saelemaekers','Hans Vanaken','Kevin De Bruyne','Jérémy Doku','Charles De Ketelaere','Leandro Trossard','Loïs Openda','Romelu Lukaku']) },
  { code: 'EGY', name: 'Egypt',        flag: '🇪🇬', stickers: ts('EGY','Egypt','🇪🇬',['Mohamed El Shenawy','Mohamed Hany','Mohamed Hamdy','Yasser Ibrahim','Khaled Sobhi','Ramy Rabia','Hossam Abdelmaguid','Ahmed Fatouh','Marwan Attia','Zizo','Hamdy Fathy','Mohamed Lasheen','Emam Ashour','Osama Faisal','Mohamed Salah','Mostafa Mohamed','Trezeguet','Omar Marmoush']) },
  { code: 'IRN', name: 'Iran',         flag: '🇮🇷', stickers: ts('IRN','Iran','🇮🇷',['Alireza Beiranvand','Morteza Pouraliganji','Ehsan Hajsafi','Milad Mohammadi','Shojae Khalilzadeh','Ramin Rezaeian','Hossein Kanaani','Sadegh Moharrami','Saleh Hardani','Saeed Ezatolahi','Saman Ghoddos','Omid Noorafkan','Roozbeh Cheshmi','Mohammad Mohebi','Sardar Azmoun','Mehdi Taremi','Alireza Jahanbakhsh','Ali Gholizadeh']) },
  { code: 'NZL', name: 'New Zealand',  flag: '🇳🇿', stickers: ts('NZL','New Zealand','🇳🇿',['Max Crocombe Payne','Alex Paulsen','Michael Boxall','Liberato Cacace','Tim Payne','Tyler Bindon','Francis de Vries','Finn Surman','Joe Bell','Sarpreet Singh','Ryan Thomas','Matthew Garbett','Marko Stamenić','Ben Old','Chris Wood','Elijah Just','Callum McCowatt','Kosta Barbarouses']) },
  { code: 'ESP', name: 'Spain',        flag: '🇪🇸', stickers: ts('ESP','Spain','🇪🇸',['Unai Simon','Robin Le Normand','Aymeric Laporte','Dean Huijsen','Pedro Porro','Dani Carvajal','Marc Cucurella','Martín Zubimendi','Rodri','Pedri','Fabian Ruiz','Mikel Merino','Lamine Yamal','Dani Olmo','Nico Williams','Ferran Torres','Álvaro Morata','Mikel Oyarzabal']) },
  { code: 'CPV', name: 'Cabo Verde',   flag: '🇨🇻', stickers: ts('CPV','Cabo Verde','🇨🇻',['Vozinha','Logan Costa','Pico','Diney','Steven Moreira','Wagner Pina','Joao Paulo','Yannick Semedo','Kevin Pina','Patrick Andrade','Jamiro Monteiro','Deroy Duarte','Garry Rodrigues','Jovane Cabral','Ryan Mendes','Dailon Livramento','Willy Semedo','Bebe']) },
  { code: 'KSA', name: 'Saudi Arabia', flag: '🇸🇦', stickers: ts('KSA','Saudi Arabia','🇸🇦',['Nawaf Alaqidi','Abdulrahman Al-Sanbi','Saud Abdulhamid','Nawaf Bouwashl','Jihad Thakri','Moteb Al-Harbi','Hassan Altambakti','Musab Aljuwayr','Ziyad Aljohani','Abdullah Alkhaibari','Nasser Aldawsari','Saleh Abu Alshamat','Marwan Alsahafi','Salem Aldawsari','Abdulrahman Al-Aboud','Feras Akbrikan','Saleh Alshehri','Abdullah Al-Hamdan']) },
  { code: 'URU', name: 'Uruguay',      flag: '🇺🇾', stickers: ts('URU','Uruguay','🇺🇾',['Sergio Rochet','Santiago Mele','Ronald Araujo','José María Giménez','Sebastian Caceres','Mathias Olivera','Guillermo Varela','Nahitan Nandez','Federico Valverde','Giorgian De Arrascaeta','Rodrigo Bentancur','Manuel Ugarte','Nicolás de la Cruz','Maxi Araujo','Darwin Núñez','Federico Viñas','Rodrigo Aguirre','Facundo Pellistri']) },
  { code: 'FRA', name: 'France',       flag: '🇫🇷', stickers: ts('FRA','France','🇫🇷',['Mike Maignan','Theo Hernandez','William Saliba','Jules Kounde','Ibrahima Konate','Dayot Upamecano','Lucas Digne','Aurélien Tchouaméni','Eduardo Camavinga','Manu Kone','Adrien Rabiot','Michael Olise','Ousmane Dembele','Bradley Barcola','Désiré Doué','Kingsley Coman','Hugo Ekitike','Kylian Mbappe']) },
  { code: 'SEN', name: 'Senegal',      flag: '🇸🇳', stickers: ts('SEN','Senegal','🇸🇳',['Edouard Mendy','Yehvann Diouf','Moussa Niakhaté','Abdoulaye Seck','Ismail Jakobs','El Hadji Malick Diouf','Kalidou Koulibaly','Idrissa Gana Gueye','Pape Matar Sarr','Pape Gueye','Habib Diarra','Lamine Camara','Sadio Mane','Ismaïla Sarr','Boulaye Dia','Iliman Ndiaye','Nicolas Jackson','Krepin Diatta']) },
  { code: 'IRQ', name: 'Iraq',         flag: '🇮🇶', stickers: ts('IRQ','Iraq','🇮🇶',['Jalal Hassan','Rebin Sulaka','Hussein Ali','Akam Hashem','Merchas Doski','Zaid Tahseen','Manaf Younis','Zidane Iqbal','Amir Al-Ammari','Ibrahim Bavesh','Ali Jasim','Youssef Amyn','Aimar Sher','Marko Farji','Osama Rashid','Ali Al-Hamadi','Aymen Hussein','Mohanad Ali']) },
  { code: 'NOR', name: 'Norway',       flag: '🇳🇴', stickers: ts('NOR','Norway','🇳🇴',['Orjan Nyland','Julian Ryerson','Leo Ostigård','Kristoffer Vassbakk Ajer','Marcus Holmgren Pedersen','David Møller Wolfe','Torbjørn Heggem','Morten Thorsby','Martin Ødegaard','Sander Berge','Andreas Schjelderup','Patrick Berg','Erling Haaland','Alexander Sørloth','Aron Dønnum','Jorgen Strand Larsen','Antonio Nusa','Oscar Bobb']) },
  { code: 'ARG', name: 'Argentina',    flag: '🇦🇷', stickers: ts('ARG','Argentina','🇦🇷',['Emiliano Martinez','Nahuel Molina','Cristian Romero','Nicolas Otamendi','Nicolas Tagliafico','Leonardo Balerdi','Enzo Fernandez','Alexis Mac Allister','Rodrigo De Paul','Exequiel Palacios','Leandro Paredes','Nico Paz','Franco Mastantuono','Nico Gonzalez','Lionel Messi','Lautaro Martinez','Julian Alvarez','Giuliano Simeone']) },
  { code: 'ALG', name: 'Algeria',      flag: '🇩🇿', stickers: ts('ALG','Algeria','🇩🇿',['Alexis Guendouz','Ramy Bensebaini','Youcef Atal','Rayan Aït-Nouri','Mohamed Amine Tougai','Aïssa Mandi','Ismael Bennacer','Houssem Aquar','Hicham Boudaoui','Ramiz Zerrouki','Nabil Bentalab','Farés Chaibi','Riyad Mahrez','Said Benrahma','Anis Hadj Moussa','Amine Gouiri','Baghdad Bounedjah','Mohammed Amoura']) },
  { code: 'AUT', name: 'Austria',      flag: '🇦🇹', stickers: ts('AUT','Austria','🇦🇹',['Alexander Schlager','Patrick Pentz','David Alaba','Kevin Danso','Philipp Lienhart','Stefan Posch','Phillipp Mwene','Alexander Prass','Xaver Schlager','Marcel Sabitzer','Konrad Laimer','Florian Grillitsch','Nicolas Seiwald','Romano Schmid','Patrick Wimmer','Christoph Baumgartner','Michael Gregoritsch','Marko Arnautović']) },
  { code: 'JOR', name: 'Jordan',       flag: '🇯🇴', stickers: ts('JOR','Jordan','🇯🇴',['Yazeed Abulaila','Ihsan Haddad','Mohammad Abu Hashish','Yazan Al-Arab','Abdallah Nasib','Saleem Obaid','Mohammad Abualnadi','Ibrahim Saadeh','Nizar Al-Rashdan','Noor Al-Rawabdeh','Mohannad Abu Taha','Amer Jamous','Musa Al-Taamari','Yazan Al-Naimat','Mahmoud Al-Mardi','Ali Olwan','Mohammad Abu Zrayq','Ibrahim Sabra']) },
  { code: 'POR', name: 'Portugal',     flag: '🇵🇹', stickers: ts('POR','Portugal','🇵🇹',['Diogo Costa','Jose Sa','Ruben Dias','João Cancelo','Diogo Dalot','Nuno Mendes','Gonçalo Inácio','Bernardo Silva','Bruno Fernandes','Ruben Neves','Vitinha','João Neves','Cristiano Ronaldo','Francisco Trincao','João Felix','Gonçalo Ramos','Pedro Neto','Rafael Leão']) },
  { code: 'COD', name: 'Congo DR',     flag: '🇨🇩', stickers: ts('COD','Congo DR','🇨🇩',['Lionel Mpasi','Aaron Wan-Bissaka','Axel Tuanzebe','Arthur Masuaku','Chancel Mbemba','Joris Kayembe','Charles Pickel','Ngal\'ayel Mukau','Edo Kayembe','Samuel Moutoussamy','Noah Sadiki','Théo Bongonda','Meschak Elia','Yoane Wissa','Brian Cipenga','Fiston Mayele','Cédric Bakambu','Nathanaël Mbuku']) },
  { code: 'UZB', name: 'Uzbekistan',   flag: '🇺🇿', stickers: ts('UZB','Uzbekistan','🇺🇿',['Utkir Yusupov','Farrukh Savfiev','Sherzod Nasrullaev','Umar Eshmurodov','Husniddin Aliqulov','Rustamjon Ashurmatov','Khojiakbar Alijonov','Abdukodir Khusanov','Odiljon Hamrobekov','Otabek Shukurov','Jamshid Iskanderov','Azizbek Turgunboev','Khojimat Erkinov','Eldor Shomurodov','Oston Urunov','Jaloliddin Masharipov','Igor Sergeev','Abbosbek Fayzullaev']) },
  { code: 'COL', name: 'Colombia',     flag: '🇨🇴', stickers: ts('COL','Colombia','🇨🇴',['Camilo Vargas','David Ospina','Dávinson Sánchez','Yerry Mina','Daniel Munoz','Johan Mojica','Jhon Lucumí','Santiago Arias','Jefferson Lerma','Kevin Castaño','Richard Rios','James Rodriguez','Juan Fernando Quintero','Jorge Carrascal','Jon Arias','Jhon Cordova','Luis Suarez','Luis Diaz']) },
  { code: 'ENG', name: 'England',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stickers: ts('ENG','England','🏴󠁧󠁢󠁥󠁮󠁧󠁿',['Jordan Pickford','John Stones','Marc Guéhi','Ezri Konsa','Trent Alexander-Arnold','Reece James','Dan Burn','Jordan Henderson','Declan Rice','Jude Bellingham','Cole Palmer','Morgan Rogers','Anthony Gordon','Phil Foden','Bukayo Saka','Harry Kane','Marcus Rashford','Ollie Watkins']) },
  { code: 'CRO', name: 'Croatia',      flag: '🇭🇷', stickers: ts('CRO','Croatia','🇭🇷',['Dominik Livaković','Duje Caleta-Car','Josko Gvardiol','Josip Stanišić','Luka Vušković','Josip Sutalo','Kristijan Jakic','Luka Modrić','Mateo Kovacic','Martin Baturina','Lovro Majer','Mario Pasalic','Petar Sucic','Ivan Perišić','Marco Pasalic','Ante Budimir','Andrej Kramarić','Franjo Ivanovic']) },
  { code: 'GHA', name: 'Ghana',        flag: '🇬🇭', stickers: ts('GHA','Ghana','🇬🇭',['Lawrence Ati Zigi','Tariq Lamptey','Mohammed Salisu','Alidu Seidu','Alexander Djiku','Gideon Mensah','Caleb Yirenkyi','Abdul Issahaku Fatawu','Thomas Partey','Salis Abdul Samed','Kamaldeen Sulemana','Mohammed Kudus','Inaki Williams','Jordan Ayew','Andrew Ayew','Joseph Paintsil','Osman Bukari','Antoine Semenyo']) },
  { code: 'PAN', name: 'Panama',       flag: '🇵🇦', stickers: ts('PAN','Panama','🇵🇦',['Orlando Mosquera','Luis Mejia','Fidel Escobar','Andres Andrade','Michael Amir Murillo','Eric Davis','Jose Cordoba','Cesar Blackman','Cristian Martinez','Aníbal Godoy','Adalberto Carrasquilla','Édgar Bárcenas','Carlos Harvey','Ismael Díaz','Jose Fajardo','Cecilio Waterman','Jose Luiz Rodriguez','Alberto Quintero']) },
]

// ── Derived exports ───────────────────────────────────────────────
export const ALL_STICKERS = [
  ...SPECIAL_SECTIONS.intro.stickers,
  ...TEAMS.flatMap(t => t.stickers),
  ...SPECIAL_SECTIONS.museum.stickers,
]

export const TOTAL_STICKERS = ALL_STICKERS.length // 980

export const STICKER_MAP = new Map(ALL_STICKERS.map(s => [s.id, s]))
