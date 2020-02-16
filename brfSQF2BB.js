/*
	Conversion de breifing.sqf en BBCODE
    v1.0, du 15/02/2020 :
    - Version initiale
    v1.1, du 16/02/2020 :
    - Copie automatiquement le BBCODE obtenu dans le presse papier
	Auteur : tanin69
*/

/* TODO
- Donner à manger un fichier au lieu d'un copier/coller
- Améliorer la gestion des retours à la ligne
- Copier automatiquement le texte résultat dans le presse-papier 


// L'entête ci-desous doit être collée dans le briefing

/* DEBUT ENTETE */

/*	MODIFIEZ CI-DESSOUS : Titre, map, auteur, etc.
	BB_TITLE          CPC-CO[08]-Prof_Henri_Lis -/
	BB_MAP            Caribou -/
	BB_AUTHOR         tanin69 -/
	BB_COMMENT        Une mission très spéciale, pas franchement milsim, pour laquelle Shinriel a laissé se déchainer ses talents de scripteur fou ! -/
	BB_IMG            https://tof.cx/images/2020/02/15/dc9bdec88e53a9769b145bf0260d7116.jpg -/
	BB_IMG_SBTITLE    Un sous-titre quelconque apparaissant après l'iamage -/
*/

/*	NE TOUCHEZ RIEN ci-dessous si vous ne savez pas ce que vous faites !
	// 	Définition des mises en forme BBCode
	BBFormat_TITLE        [b][color=#0000FF][size=150]rpltext[/size][/color][/b] -/  Grande taille, gras, bleu
	BBFormat_TITLE1       [color=#0000FF][b][u]rpltext[/u][/b][/color]           -/  Gras, souligné, bleu
	BBFormat_MAP          [b][color=#0000FF]Map: rpltext[/color][/b]             -/  Gras, bleu
	BBFormat_AUTHOR       [b][color=#0000FF]Auteur: rpltext[/color][/b]          -/  Gras, bleu
	BBFormat_Comment      [b][color=#BF0000]rpltext[/color][/b]                  -/  Gras, rouge
	BBFormat_IMG          [img]rpltext[/img]                                     -/  Image au format simple
	BBFormat_IMG_SBTITLE  [i]rpltext[/i]                                         -/  Italique, noir
	// Correspondances des mises en forme : SQF2BBC COLSQF  'Format BBCODE'
	SQF2BBC  <font color='#ff0505'>rpltext</font color> '[color=#ff0505]rpltext[/color]'        -/  rouge -> rouge                        
	SQF2BBC  <font color='#5ACE00'>rpltext</font color> '[color=#ff0505]rpltext[/color]'        -/  vert -> rouge
	SQF2BBC  <font color='#ff9605'>rpltext</font color> '[i][color=#ff9605]rpltext[/color][/i]' -/  orange -> Italique, orange
*/

/* FIN ENTETE */

//Permet d'importer un fichier
var fileInput = document.querySelector('#file');
fileInput.addEventListener('change', function() {
    var reader = new FileReader();
    reader.addEventListener('load', function() {
        //alert('Contenu du fichier "' + fileInput.files[0].name + '" :\n\n' + reader.result);
        $('#message_success_loadfile').fadeIn('slow').delay(2000).fadeOut('slow');
        document.getElementById("textarea1").value = reader.result;
    });
    reader.readAsText(fileInput.files[0]);
});
function brfSQF2BB() {
    //Le texte à traiter : intégralité du fichier briefing.sqf

    var txt = document.getElementById("textarea1").value;
    if (txt == "") {
        $('#message_fail_notext').fadeIn('slow').delay(2000).fadeOut('slow');
        return false;
    }
    //Tableau de résultat qui sera utilisé pour générer la chaîne s
    var tbResult = [];
    //Chaine finale qui sera envoyée dans le textArea de résultat
    var s = "";
    //Délimiteur de retour à la ligne pour le textAera en BBCODE
    var delim = '\n';
	
    //Nettoie toutes les balises sqf qui peuvent l'être (ce qui est fait n'est plus à faire)
    var maRegex = /player\s+creatediaryrecord\s*\[\s*"diary"\s*,\s*\[/gmi;
    txt = txt.replace(maRegex,'');
    maRegex = /\s*\]\];/gmi;
    txt = txt.replace(maRegex,'');
    maRegex = /<\s*marker\s*name='\S+'>/gmi;
    txt = txt.replace(maRegex,'');
    maRegex = /<\s*\/marker\s*>/gmi;
    txt = txt.replace(maRegex,'');
    maRegex = /<\s*img\s*image='\S+'\s*\/>|<\s*img\s*image='\S+'\s*width='\S+'\s*height='\S+'\s*\/>/gmi;
    txt = txt.replace(maRegex,'');

    //Fait les remplacements de couleurs sqf vers mise en forme BBCODE
    //On récupère les correspondances et on le stocke dans un tableau
    reg = /SQF2BBC\s+(<font color='#.+'>)rpltext(<\/font color>)\s+'(.+)rpltext(.+)'\s*-\//gi;
    tbConversions = [];
    tbRes = [];
    while ((tbConversions = reg.exec(txt)) !== null) {
        if (tbConversions.index === reg.lastIndex) {reg.lastIndex++;}
        tbRes.push ([tbConversions[1],tbConversions[2],tbConversions[3],tbConversions[4]]);
    }
    //On fait les substitutions
    for (let i = 0; i < tbRes.length; i++){
        //[\s\S]*? ne passe pas !
        strReg = "("+tbRes[i][0]+")"+`([\\s\\S]*?)`+"("+tbRes[i][1]+")";
        reg = RegExp(strReg,"gim");
        console.log(reg);
        txt = txt.replace(reg,tbRes[i][2]+"$2"+tbRes[i][3]);
    }

    //Traitement du briefing lui-même : on choppe tout ce qui se trouve entre double quote...
    maRegex = /"((?:""|[^"])*)"/gim; 
    var tbOnglet=[];
    var indOnglets = 0;
    
    while ((tbOnglet = maRegex.exec(txt)) !== null) {
        
        // This is necessary to avoid infinite loops with zero-width matches
        if (tbOnglet.index === maRegex.lastIndex) {maRegex.lastIndex++;};
        
        var contenu = tbOnglet[1];
        //Les onglets d'indice pair sont des titres d'onglet (si tout va bien :-) )
        if ((indOnglets)%2 === 0) {
            //On met en forme le titre du sous-onglet avec BBFormat_TITLE1
            let reg = /BBFormat_TITLE1(.+)-\//i;
            var fmtOnglet = (reg.exec(txt))[1].trim();
            result = fmtOnglet.replace(/rpltext/, contenu);
            //et on insère dans le tableau de résultat
            tbResult.unshift(result);
        }
        else { //Les autres sont donc des contenus d'onglet (si tout va bien)                                
            //On traite le texte en mode brutal : on remplace les doubles <br /> par un \n et on supprime les simples <br />
            restmp = contenu.replace(/(<\s*br\s*\/\s*>){2}/gi,delim);
            result = restmp.replace(/<\s*br\s*\/\s*>/gi,'');
            //Et on insère au bon endroit
            if (indOnglets===1) {
                tbResult.push(result);
            } else {
                tbResult.splice(1,0,result);
            }         
        }

        indOnglets++;

    }
    
    //Extrait et met en forme le titre, map, etc. de l'en-tête du briefing SQF
    tbResult.unshift ( fn_regRpl (txt, /BBFormat_IMG_SBTITLE(.+)-\//, /BB_IMG_SBTITLE(.+)-\//));
    tbResult.unshift ( fn_regRpl (txt, /BBFormat_IMG(.+)-\//,         /BB_IMG(.+)-\//));
    tbResult.unshift ((fn_regRpl (txt, /BBFormat_Comment(.+)-\//,     /BB_COMMENT(.+)-\//))+"\n");
    tbResult.unshift ((fn_regRpl (txt, /BBFormat_AUTHOR(.+)-\//,      /BB_AUTHOR(.+)-\//))+"\n");
    tbResult.unshift ( fn_regRpl (txt, /BBFormat_MAP(.+)-\//,         /BB_MAP(.+)-\//));
    tbResult.unshift ( fn_regRpl (txt, /BBFormat_TITLE(.+)-\//,       /BB_TITLE(.+)-\//));
    
    //On envoie le résultat dans le textarea en parcourant le tableau
    for (i=0;i < tbResult.length; i++) {
        s = s+delim+tbResult[i];
        //s = s+tbResult[i];
    }
    
    document.getElementById("textarea2").value = s;
    //Copie le texte dans le presse papier
    document.getElementById("textarea2").select();
    document.execCommand("copy");
    //Affiche un message d'information
    $('#message_success_copyPP').fadeIn('slow').delay(2000).fadeOut('slow');

}

function fn_regRpl (stxt,reg1,reg2) {
    reg1.exec(stxt);
    let reg1s = ((RegExp.$1).trim());
    reg2.exec(stxt);
    let reg2s = ((RegExp.$1).trim());
    return reg1s.replace(/rpltext/, reg2s)
}
