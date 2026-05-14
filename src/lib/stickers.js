// ================================================================
// Panini FIFA World Cup 2026 — Complete Sticker Database (992)
// ================================================================

const T = (code, flag, name, players) => ({ code, flag, name, players })

// 48 teams with full player rosters
const TEAMS_DEF = [
  // === FROM OFFICIAL PANINI CHECKLIST ===
  T('MEX','🇲🇽','Mexico',['Luis Malagón','Johan Vasquez','Jorge Sánchez','Cesar Montes','Jesus Gallardo','Israel Reyes','Diego Lainez','Carlos Rodriguez','Edson Alvarez','Orbelin Pineda','Marcel Ruiz','Érick Sánchez','Hirving Lozano','Santiago Giménez','Raúl Jiménez','Alexis Vega','Roberto Alvarado','Cesar Huerta']),
  T('RSA','🇿🇦','South Africa',['Ronwen Williams','Sipho Chaine','Aubrey Modiba','Samukele Kabini','Mbekezeli Mbokazi','Khulumani Ndamane','Siyabonga Ngezana','Khuliso Mudau','Nkosinathi Sibisi','Teboho Mokoena','Thalente Mbatha','Bathasi Aubaas','Yaya Sithole','Sipho Mbule','Lyle Foster','Iqraam Rayners','Mohau Nkota','Oswin Appollis']),
  T('KOR','🇰🇷','South Korea',['Hyeon-woo Jo','Seung-Gyu Kim','Min-jae Kim','Yu-min Cho','Young-woo Seol','Han-beom Lee','Tae-seok Lee','Myung-jae Lee','Jae-sung Lee','In-beom Hwang','Kang-in Lee','Seung-ho Paik','Jens Castrop','Dong-yeong Lee','Gue-sung Cho','Heung-min Son','Hee-chan Hwang','Hyeon-Gyu Oh']),
  T('CZE','🇨🇿','Czechia',['Matej Kovar','Jindrich Stanek','Ladislav Krejci','Vladimir Coufal','Jaroslav Zeleny','Tomas Holes','David Zima','Michal Sadilek','Lukas Provod','Lukas Cerv','Tomas Soucek','Pavel Sulc','Matej Vydra','Vasil Kusej','Tomas Chory','Vaclav Cerny','Adam Hlozek','Patrik Schick']),
  T('CAN','🇨🇦','Canada',['Dayne St. Clair','Alphonso Davies','Alistair Johnston','Samuel Adekugbe','Riche Larvea','Derek Cornelius','Moïse Bombito','Kamal Miller','Stephen Eustáquio','Ismaël Koné','Jonathan Osorio','Jacob Shaffelburg','Mathieu Choinière','Niko Sigur','Tajon Buchanan','Liam Millar','Cyle Larin','Jonathan David']),
  T('BIH','🇧🇦','Bosnia & Herzegovina',['Nikola Vasilj','Amer Dedic','Sead Kolasinac','Tarik Muharemovic','Nihad Mujakic','Nikola Katic','Amir Hadziahmetovic','Benjamin Tahirovic','Armin Gigovic','Ivan Sunjic','Ivan Basic','Dzenis Burnic','Esmir Bajraktarevic','Amar Memic','Ermedin Demirovic','Edin Dzeko','Samed Bazdar','Haris Tabakovic']),
  T('QAT','🇶🇦','Qatar',['Meshaal Barsham','Sultan Albrake','Lucas Mendes','Homam Ahmed','Boualem Khoukhi','Pedro Miguel','Tarek Salman','Mohamed Al-Mannai','Karim Boudiaf','Assim Madibo','Ahmed Fatehi','Mohammed Waad','Abdulaziz Hatem','Hassan Al-Haydos','Edmilson Junior','Akram Hassan Afif','Ahmed Al Ganehi','Almoez Ali']),
  T('SUI','🇨🇭','Switzerland',['Gregor Kobel','Yvon Mvogo','Manuel Akanji','Ricardo Rodriguez','Nico Elvedi','Aurèle Amenda','Silvan Widmer','Granit Xhaka','Denis Zakaria','Remo Freuler','Fabian Rieder','Ardon Jashari','Johan Manzambi','Michel Aebischer','Breel Embolo','Ruben Vargas','Dan Ndoye','Zeki Amdouni']),
  T('BRA','🇧🇷','Brazil',['Alisson','Bento','Marquinhos','Éder Militão','Gabriel Magalhães','Danilo','Wesley','Lucas Paquetá','Casemiro','Bruno Guimarães','Luiz Henrique','Vinicius Júnior','Rodrygo','João Pedro','Matheus Cunha','Gabriel Martinelli','Raphinha','Estévão']),
  T('MAR','🇲🇦','Morocco',['Yassine Bounou','Munir El Kajoui','Achraf Hakimi','Noussair Mazraoui','Nayef Aguerd','Roman Saiss','Jawad El Yamiq','Adam Masina','Sofyan Amrabat','Azzedine Ounahi','Eliesse Ben Seghir','Bilal El Khannouss','Ismael Saibari','Youssef En-Nesyri','Abde Ezzalzouli','Soufiane Rahimi','Brahim Diaz','Ayoub El Kaabi']),
  T('HAI','🇭🇹','Haiti',['Johny Placide','Carlens Arcus','Martin Expérience','Jean-Kevin Duverne','Ricardo Adé','Duke Lacroix','Garven Metusala','Hannes Delcroix','Leverton Pierre','Danley Jean Jacques','Jean-Ricner Bellegarde','Christopher Attys','Derrick Etienne Jr','Josue Casimir','Ruben Providence','Duckens Nazon','Louicius Deedson','Frantzdy Pierrot']),
  T('SCO','🏴󠁧󠁢󠁳󠁣󠁴󠁿','Scotland',['Angus Gunn','Jack Hendry','Kieran Tierney','Aaron Hickey','Andrew Robertson','Scott McKenna','John Souttar','Anthony Ralston','Grant Hanley','Scott McTominay','Billy Gilmour','Lewis Ferguson','Ryan Christie','Kenny McLean','John McGinn','Lyndon Dykes','Che Adams','Ben Doak']),
  T('USA','🇺🇸','United States',['Matt Freese','Chris Richards','Tim Ream','Mark McKenzie','Antonee Robinson','Alex Freeman','Tyler Adams','Tanner Tessmann','Weston McKennie','Christian Roldan','Timothy Weah','Diego Luna','Malik Tillman','Christian Pulisic','Brenden Aaronson','Ricardo Pepi','Haji Wright','Folarin Balogun']),
  T('PAR','🇵🇾','Paraguay',['Roberto Fernandez','Orlando Gill','Gustavo Gomez','Fabián Balbuena','Juan José Cáceres','Omar Alderete','Junior Alonso','Mathías Villasanti','Diego Gomez','Damián Bobadilla','Andres Cubas','Matias Galarza','Julio Enciso','Alejandro Romero Gamarra','Miguel Almirón','Ramon Sosa','Angel Romero','Antonio Sanabria']),
  T('AUS','🇦🇺','Australia',['Mathew Ryan','Joe Gauci','Harry Souttar','Alessandro Circati','Jordan Bos','Aziz Behich','Cameron Burgess','Lewis Miller','Milos Degenek','Jackson Irvine','Riley McGree',"Aiden O'Neill",'Connor Metcalfe','Patrick Yazbek','Craig Goodwin','Kusini Vengi','Nestory Irankunda','Mohamed Touré']),
  // === MAJOR TEAMS — KNOWN SQUADS ===
  T('ARG','🇦🇷','Argentina',['Emiliano Martínez','Nahuel Molina','Cristian Romero','Lisandro Martínez','Nicolás Tagliafico','Guido Rodríguez','Rodrigo De Paul','Enzo Fernández','Alexis Mac Allister','Lionel Messi','Lautaro Martínez','Julián Álvarez','Paulo Dybala','Ángel Correa','Nicolás González','Alejandro Garnacho','Germán Pezzella','Facundo Medina']),
  T('FRA','🇫🇷','France',['Mike Maignan','Alphonse Areola','Jules Koundé','Dayot Upamecano','William Saliba','Theo Hernández','Aurélien Tchouaméni',"N'Golo Kanté",'Eduardo Camavinga','Kylian Mbappé','Antoine Griezmann','Ousmane Dembélé','Marcus Thuram','Randal Kolo Muani','Christopher Nkunku','Olivier Giroud','Kingsley Coman','Bradley Barcola']),
  T('ENG','🏴󠁧󠁢󠁥󠁮󠁧󠁿','England',['Jordan Pickford','Dean Henderson','Trent Alexander-Arnold','John Stones','Harry Maguire','Luke Shaw','Declan Rice','Jude Bellingham','Phil Foden','Harry Kane','Bukayo Saka','Marcus Rashford','Kobbie Mainoo','Jack Grealish','Cole Palmer','Ollie Watkins','Jarrod Bowen','Eberechi Eze']),
  T('GER','🇩🇪','Germany',['Manuel Neuer','Oliver Baumann','Antonio Rüdiger','Jonathan Tah','Nico Schlotterbeck','David Raum','Joshua Kimmich','Leon Goretzka','Ilkay Gündogan','Florian Wirtz','Jamal Musiala','Kai Havertz','Thomas Müller','Leroy Sané','Niclas Füllkrug','Serge Gnabry','Aleksandar Pavlović','Maximilian Mittelstädt']),
  T('ESP','🇪🇸','Spain',['Unai Simón','David Raya','Dani Carvajal','Alejandro Balde','Robin Le Normand','Aymeric Laporte','Pedri','Gavi','Fabián Ruiz','Lamine Yamal','Nico Williams','Álvaro Morata','Mikel Oyarzabal','Dani Olmo','Ferran Torres','Rodrigo Moreno','Álex Baena','Yeremy Pino']),
  T('POR','🇵🇹','Portugal',['Diogo Costa','Rui Patrício','João Cancelo','Rúben Dias','Pepe','Nuno Mendes','João Palhinha','Bruno Fernandes','Bernardo Silva','Vitinha','Cristiano Ronaldo','Rafael Leão','Pedro Neto','Gonçalo Ramos','Diogo Jota','Francisco Conceição','Otávio','João Félix']),
  T('NED','🇳🇱','Netherlands',['Bart Verbruggen','Jasper Cillessen','Denzel Dumfries','Stefan de Vrij','Virgil van Dijk','Nathan Aké','Frenkie de Jong','Tijjani Reijnders','Jerdy Schouten','Cody Gakpo','Memphis Depay','Donyell Malen','Wout Weghorst','Xavi Simons','Ryan Gravenberch','Lutsharel Geertruida','Brian Brobbey','Steven Bergwijn']),
  T('CRO','🇭🇷','Croatia',['Dominik Livaković','Ivica Ivušić','Josip Stanišić','Dejan Lovren','Joško Gvardiol','Borna Barišić','Luka Modrić','Mateo Kovačić','Marcelo Brozović','Ivan Perišić','Andrej Kramarić','Bruno Petković','Ante Budimir','Lovro Majer','Nikola Vlašić','Mario Pašalić','Martin Baturina','Luka Sučić']),
  T('JPN','🇯🇵','Japan',['Shuichi Gonda','Zion Suzuki','Hiroki Sakai','Ko Itakura','Maya Yoshida','Yuto Nagatomo','Wataru Endou','Hidemasa Morita','Takumi Minamino','Kaoru Mitoma','Daichi Kamada','Ritsu Doan','Ayase Ueda','Ao Tanaka','Yukinari Sugawara','Junya Ito','Naoki Ogawa','Keito Nakamura']),
  T('COL','🇨🇴','Colombia',['Camilo Vargas','Álvaro Montero','Santiago Arias','Jhon Lucumí','Dávinson Sánchez','Johan Mojica','Matheus Uribe','Juan Cuadrado','James Rodríguez','Luis Díaz','Jhon Córdoba','Rafael Santos Borré','Cucho Hernández','Jefferson Lerma','Daniel Muñoz','Óscar Murillo','Jhon Arias','Carlos Cuesta']),
  T('URU','🇺🇾','Uruguay',['Sergio Rochet','Sebastián Sosa','José María Giménez','Ronald Araújo','Mathías Olivera','Nahitan Nández','Rodrigo Bentancur','Federico Valverde','Nicolás de la Cruz','Darwin Núñez','Luis Suárez','Facundo Torres','Maximiliano Gómez','Edinson Cavani','Agustín Canobbio','Santiago Bueno','Maxi Araújo','Brian Rodríguez']),
  T('ECU','🇪🇨','Ecuador',['Hernán Galíndez','Moisés Ramírez','Piero Hincapié','Félix Torres','Jackson Porozo','Pervis Estupiñán','Carlos Gruezo','Moisés Caicedo','Alan Franco','Jeremy Sarmiento','Gonzalo Plata','Enner Valencia','Michael Estrada','Kendry Páez','Anthony Valencia','Jordy Caicedo','Willian Pacho','Byron Castillo']),
  T('SEN','🇸🇳','Senegal',['Édouard Mendy','Alfred Gomis','Kalidou Koulibaly','Abdou Diallo','Youssouf Sabaly','Saliou Ciss','Nampalys Mendy','Idrissa Gueye','Pape Matar Sarr','Sadio Mané','Ismaïla Sarr','Boulaye Dia','Nicolas Jackson','Krepin Diatta','Lamine Camara','Iliman Ndiaye','Habib Diallo','Cheikhou Kouyaté']),
  T('NGA','🇳🇬','Nigeria',['Stanley Nwabali','Francis Uzoho','Semi Ajayi','William Troost-Ekong','Ola Aina','Zaidu Sanusi','Wilfred Ndidi','Alex Iwobi','Frank Onyeka','Moses Simon','Victor Osimhen','Kelechi Iheanacho','Samuel Chukwueze','Taiwo Awoniyi','Ademola Lookman','Chidera Ejuke','Calvin Bassey','Paul Onuachu']),
  T('EGY','🇪🇬','Egypt',['Mohamed El-Shenawy','Gabaski','Ahmed Hegazi','Omar Kamal','Mohamed Abdel-Moneim','Akram Tawfik','Mohamed Elneny','Tarek Hamed','Trezeguet','Mohamed Salah','Omar Marmoush','Mustafa Mohamed','Zizo','Amr El Sulaya','Kahraba','Mahmoud Hassan','Emam Ashour','Ayman Ashraf']),
  T('POL','🇵🇱','Poland',['Wojciech Szczęsny','Łukasz Skorupski','Matty Cash','Jan Bednarek','Kamil Glik','Bartosz Bereszyński','Piotr Zieliński','Grzegorz Krychowiak','Mateusz Klich','Robert Lewandowski','Karol Świderski','Arkadiusz Milik','Kamil Grosicki','Sebastian Szymański','Adam Buksa','Nicola Zalewski','Jakub Moder','Kacper Urbański']),
  T('SRB','🇷🇸','Serbia',['Predrag Rajković','Vanja Milinković-Savić','Strahinja Pavlović','Nikola Milenković','Filip Mladenović','Nemanja Gudelj','Sergej Milinković-Savić','Dušan Tadić','Aleksandar Mitrović','Dušan Vlahović','Filip Kostić','Luka Jović','Andrija Živković','Saša Lukić','Darko Lazović','Strahinja Eraković','Uroš Račić','Ivan Ilić']),
  T('SAU','🇸🇦','Saudi Arabia',['Mohammed Al-Owais','Mohammed Al-Rubaie','Saud Abdulhamid','Ali Al-Bulayhi','Sultan Al-Ghannam','Abdulelah Al-Amri','Mohammed Kanno','Saleh Al-Shehri','Sami Al-Najei','Salem Al-Dawsari','Firas Al-Buraikan','Hattan Bahebri','Ali Al-Hassan','Abdullah Al-Khaibari','Yasser Al-Shahrani','Nawaf Al-Abed','Abdullah Al-Hamdan','Mohamed Maran']),
  T('IRN','🇮🇷','Iran',['Alireza Beiranvand','Hossein Hosseini','Shoja Khalilzadeh','Milad Mohammadi','Sadegh Moharrami','Majid Hosseini','Omid Noorafkan','Ali Ghafouri','Ahmad Noorollahi','Sardar Azmoun','Mehdi Taremi','Karim Ansarifard','Allahyar Sayyadmanesh','Saman Ghoddos','Ehsan Hajsafi','Ali Karimi','Ramin Rezaeian','Morteza Pouraliganji']),
  T('ROU','🇷🇴','Romania',['Florin Niță','Horațiu Moldovan','Andrei Rațiu','Radu Drăgușin','Adrian Rus','Ionuț Nedelcearu','Marius Marin','Răzvan Marin','Nicolae Stanciu','Dennis Man','Florinel Coman','George Pușcaș','Denis Alibec','Ianis Hagi','Valentin Mihăilă','Darius Olaru','Octavian Popescu','Daniel Bîrligea']),
  T('PAN','🇵🇦','Panama',['Luis Mejía','José Calderón','Fidel Escobar','Erick Davis','Andrés Andrade','Adalberto Carrasquilla','César Yanis','Aníbal Godoy','Rolando Blackburn','Ismael Díaz','Édgar Bárcenas','Cecilio Waterman','Gabriel Torres','Abdiel Arroyo','Martín Broce','Alberto Quintero','Roderick Miller','Azmahar Ariano']),
  T('JAM','🇯🇲','Jamaica',['Andre Blake','Damion Lowe','Liam Moore','Jamel Hibbert','Keammar Daley','Je-Vaughn Watson','Demarai Gray','Javain Brown','Bobby Reid','Leon Bailey','Shamar Nicholson','Michail Antonio','Ravel Morrison','Greg Leigh','Daniel Johnson','Kasey Palmer','Nathan Tjoe-A-On','Loïc Mbe Soh']),
  T('TUR','🇹🇷','Türkiye',['Ugurcan Cakir','Mert Gunok','Zeki Celik','Merih Demiral','Samet Akaydin','Ferdi Kadıoğlu','Hakan Çalhanoğlu','Salih Özcan','Kaan Ayhan','Kenan Yıldız','Arda Güler','Barış Alper Yılmaz','Yusuf Yazıcı','Orkun Kökçü','Cenk Tosun','Ozan Kabak','Okay Yokuslu','Halil Dervişoğlu']),
  T('AUT','🇦🇹','Austria',['Patrick Pentz','Heinz Lindner','Stefan Posch','Martin Hinteregger','Philipp Lienhart','Maximilian Wöber','Xaver Schlager','Konrad Laimer','Marcel Sabitzer','Christoph Baumgartner','Marko Arnautović','Michael Gregoritsch','Sasa Kalajdzic','Andreas Weimann','Florian Grillitsch','David Alaba','Patrick Wimmer','Romano Schmid']),
  T('CMR','🇨🇲','Cameroon',['André Onana','Devis Epassy','Collins Fai','Ambroise Oyongo','Jean-Charles Castelletto','Wilfried Singo','Pierre Kunde','Samuel Gouet','Martin Hongla','Eric Choupo-Moting','Karl Toko Ekambi','Stéphane Bahoken','Jean-Pierre Nsame','Georges-Kévin Nkoudou','Nicolas Ngamaleu','Harold Moukoudi','Gaël Ondoua','Vincent Aboubakar']),
  T('CPV','🇨🇻','Cape Verde',['Vozinha','Marco Soares','Kenny Rocha','Logan Costa','Stopira','Ryan Mendes','Jamiro Monteiro','Garry Rodrigues','Lúcio Antunes','Gilson Tavares','Nuno Tavares','Lisandro Semedo','Willy Semedo','Júlio Tavares','Djaniny','Bryan Teixeira','Bebé','Marco Matias']),
  T('COD','🇨🇩','DR Congo',['Joël Kiassumbua','Elia Meschack','Chancel Mbemba','Ngita Makabi','Arthur Masuaku','Youssouf Mulumbu','Gaël Kakuta','Théo Bongonda','Cédric Bakambu','Dieumerci Mbokani','Yannick Bolasie','Jonathan Bolingi','Firmin Mubele','Christian Luyindama','Jordan Ikoko','Silas Katompa','Paul-José Mpoku','Doumbia Yannick']),
  T('MLI','🇲🇱','Mali',['Djigui Diarra','Soumaïla Diakité','Hamari Traoré','Falaye Sacko','Mamadou Coulibaly','Amadou Haidara','Diadie Samassekou','Moussa Doumbia','Adama Traoré','Ibrahima Koné','Lassine Sinayoko','Moussa Djenepo','El Bilal Touré','Sékou Koïta','Yves Bissouma','Aliou Dieng','Mohamed Camara','Mamadou Koné']),
  T('NZL','🇳🇿','New Zealand',['Michael Woud','Stefan Marinovic','Ryan Thomas','Winston Reid','Tommy Smith','Liberato Cacace','Tim Payne','Noah Billingsley','Joe Bell','Chris Wood','Matt Garbett','Sarpreet Singh','Alex Greive','Clayton Lewis','Ben Old','Oli Sail','Callan Elliot','Hamish Watson']),
  T('UZB','🇺🇿','Uzbekistan',['Utkir Yusupov','Eldor Shomurodov','Sherzod Nishonov','Javokhir Sidiqov','Dilshod Jurayev','Otabek Shukurov','Islom Tukhtahujaev','Jasur Yaxshiboev','Jamshid Iskanderov','Abbosbek Fayzullaev','Dostonbek Khamdamov','Sanjar Tursunov','Khojiakbar Alijonov','Temur Qodirov','Kuvondiq Djalilov','Muzaffar Mirzayev','Mirzohid Halimov','Oybek Kilichev']),
  T('IDN','🇮🇩','Indonesia',['Ernando Ari','Muhammad Riyandi','Rizky Ridho','Justin Hubner','Elkan Baggott','Pratama Arhan','Marc Klok','Ivar Jenner','Marselino Ferdinan','Rafael Struick','Egy Maulana Vikri','Witan Sulaeman','Asnawi Mangkualam','Sandy Walsh','Nathan Tjoe-A-On','Mees Hilgers','Thom Haye','Jay Idzes']),
  T('HON','🇭🇳','Honduras',['Luis López','Marlon Licona','Maynor Figueroa','Henry Figueroa','Víctor Bernárdez','Emilio Izaguirre','Boniek García','Alberth Elis','Edwin Rodríguez','Romell Quioto','Jorge Álvarez','Anthony Lozano','Jerry Bengtson','Eddie Hernández','Andy Najar','Brayan Moya','Brayan Beckeles','Johnny Palacios']),
  T('CRC','🇨🇷','Costa Rica',['Keylor Navas','Leonel Moreira','Keysher Fuller','Juan Pablo Vargas','Francisco Calvo','Bryan Oviedo','Celso Borges','Yeltsin Tejeda','Bryan Ruiz','Alonso Martínez','Johan Venegas','Anthony Contreras','Ariel Lassiter','Manfred Ugalde','Jewison Bennette','Óscar Duarte','David Guzmán','Joel Campbell']),
]

// Build 20 stickers per team: badge(1) + players(2-12) + photo(13) + players(14-20)
function buildTeamStickers(def) {
  const { code, flag, name, players } = def
  return [
    { id: `${code}1`, label: 'Team Badge', foil: true, type: 'badge', team: name, flag, code },
    ...players.slice(0, 11).map((label, i) => ({ id: `${code}${i + 2}`, label, foil: false, type: 'player', team: name, flag, code })),
    { id: `${code}13`, label: 'Team Photo', foil: false, type: 'photo', team: name, flag, code },
    ...players.slice(11).map((label, i) => ({ id: `${code}${i + 14}`, label, foil: false, type: 'player', team: name, flag, code })),
  ]
}

export const TEAMS = TEAMS_DEF.map(def => ({
  code: def.code,
  flag: def.flag,
  name: def.name,
  stickers: buildTeamStickers(def),
}))

export const SPECIAL_SECTIONS = {
  intro: {
    key: 'intro',
    title: 'Introduction',
    stickers: [
      { id: 'FWC0', label: 'Panini Logo', foil: true, type: 'intro', team: 'Introduction', flag: '', code: 'intro' },
      { id: 'FWC1', label: 'Official Emblem', foil: true, type: 'intro', team: 'Introduction', flag: '', code: 'intro' },
      { id: 'FWC2', label: 'Official Emblem (alt)', foil: true, type: 'intro', team: 'Introduction', flag: '', code: 'intro' },
      { id: 'FWC3', label: 'Official Mascots', foil: true, type: 'intro', team: 'Introduction', flag: '', code: 'intro' },
      { id: 'FWC4', label: 'Official Slogan', foil: true, type: 'intro', team: 'Introduction', flag: '', code: 'intro' },
      { id: 'FWC5', label: 'Official Ball', foil: true, type: 'intro', team: 'Introduction', flag: '', code: 'intro' },
      { id: 'FWC6', label: 'Canada — Host Cities', foil: true, type: 'intro', team: 'Introduction', flag: '', code: 'intro' },
      { id: 'FWC7', label: 'Mexico — Host Cities', foil: true, type: 'intro', team: 'Introduction', flag: '', code: 'intro' },
      { id: 'FWC8', label: 'USA — Host Cities', foil: true, type: 'intro', team: 'Introduction', flag: '', code: 'intro' },
    ],
  },
  museum: {
    key: 'museum',
    title: 'FIFA Museum',
    stickers: [
      { id: 'FWM1', label: 'Uruguay 1930', foil: false, type: 'museum', team: 'FIFA Museum', flag: '', code: 'museum' },
      { id: 'FWM2', label: 'Italy 1934', foil: false, type: 'museum', team: 'FIFA Museum', flag: '', code: 'museum' },
      { id: 'FWM3', label: 'Italy 1938', foil: false, type: 'museum', team: 'FIFA Museum', flag: '', code: 'museum' },
      { id: 'FWM4', label: 'Uruguay 1950', foil: false, type: 'museum', team: 'FIFA Museum', flag: '', code: 'museum' },
      { id: 'FWM5', label: 'West Germany 1954', foil: false, type: 'museum', team: 'FIFA Museum', flag: '', code: 'museum' },
      { id: 'FWM6', label: 'Brazil 1958', foil: false, type: 'museum', team: 'FIFA Museum', flag: '', code: 'museum' },
      { id: 'FWM7', label: 'Brazil 1962', foil: false, type: 'museum', team: 'FIFA Museum', flag: '', code: 'museum' },
      { id: 'FWM8', label: 'England 1966', foil: false, type: 'museum', team: 'FIFA Museum', flag: '', code: 'museum' },
      { id: 'FWM9', label: 'Brazil 1970', foil: false, type: 'museum', team: 'FIFA Museum', flag: '', code: 'museum' },
      { id: 'FWM10', label: 'West Germany 1974', foil: false, type: 'museum', team: 'FIFA Museum', flag: '', code: 'museum' },
      { id: 'FWM11', label: 'Argentina 1978', foil: false, type: 'museum', team: 'FIFA Museum', flag: '', code: 'museum' },
    ],
  },
  cc: {
    key: 'cc',
    title: 'Coca-Cola Exclusives',
    stickers: [
      { id: 'CC1', label: 'Lamine Yamal', foil: true, type: 'exclusive', team: 'Coca-Cola', flag: '', code: 'cc' },
      { id: 'CC2', label: 'Harry Kane', foil: true, type: 'exclusive', team: 'Coca-Cola', flag: '', code: 'cc' },
      { id: 'CC3', label: 'Joshua Kimmich', foil: true, type: 'exclusive', team: 'Coca-Cola', flag: '', code: 'cc' },
      { id: 'CC4', label: 'Lautaro Martínez', foil: true, type: 'exclusive', team: 'Coca-Cola', flag: '', code: 'cc' },
      { id: 'CC5', label: 'Jefferson Lerma', foil: true, type: 'exclusive', team: 'Coca-Cola', flag: '', code: 'cc' },
      { id: 'CC6', label: 'Exclusive #6', foil: true, type: 'exclusive', team: 'Coca-Cola', flag: '', code: 'cc' },
      { id: 'CC7', label: 'Exclusive #7', foil: true, type: 'exclusive', team: 'Coca-Cola', flag: '', code: 'cc' },
      { id: 'CC8', label: 'Exclusive #8', foil: true, type: 'exclusive', team: 'Coca-Cola', flag: '', code: 'cc' },
      { id: 'CC9', label: 'Exclusive #9', foil: true, type: 'exclusive', team: 'Coca-Cola', flag: '', code: 'cc' },
      { id: 'CC10', label: 'Exclusive #10', foil: true, type: 'exclusive', team: 'Coca-Cola', flag: '', code: 'cc' },
      { id: 'CC11', label: 'Exclusive #11', foil: true, type: 'exclusive', team: 'Coca-Cola', flag: '', code: 'cc' },
      { id: 'CC12', label: 'Exclusive #12', foil: true, type: 'exclusive', team: 'Coca-Cola', flag: '', code: 'cc' },
    ],
  },
}

// Flat list of all 992 stickers
export const ALL_STICKERS = [
  ...SPECIAL_SECTIONS.intro.stickers,
  ...SPECIAL_SECTIONS.museum.stickers,
  ...TEAMS.flatMap(t => t.stickers),
  ...SPECIAL_SECTIONS.cc.stickers,
]

export const TOTAL_STICKERS = ALL_STICKERS.length // 992

// Quick lookup map: sticker_id → sticker object
export const STICKER_MAP = new Map(ALL_STICKERS.map(s => [s.id.toLowerCase(), s]))