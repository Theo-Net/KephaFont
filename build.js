'use strict';

var svgicons2svgfont = require('svgicons2svgfont'),
    fs = require('fs'),
    svg2ttf = require('svg2ttf'),
    ttf2eot = require('ttf2eot'), 
    ttf2woff = require('ttf2woff'),  
    ttf2woff2 = require('ttf2woff2') ; 

/**
 * Configuration de la police
 */
var config = {
  fontName: 'KephaFont',
  author:   'Grégoire Oliveira Silva',
  license:  'Licensed under the Creative Common By 4.0',
  pathSvg:  'src/svg',
  pathFont: 'dist/font',
  pathLessSrc: 'src/icons.less',
  pathLess: 'dist/KephaFont.less',
  firstGlyph: 0xE001
} ; 


/**
 * On initialise la police
 */

var fontStream = svgicons2svgfont({
  fontName: config.fontName,
  normalize: true, 
  metadata: config.author + '. ' + config.license
}) ; 
fontStream.pipe(
    fs.createWriteStream(config.pathFont + '/' + config.fontName + '.svg'))
  .on('finish', function () {
    console.log('SVG font successfully created!') ; 
    createLess(glyphs) ; 
    convertFont() ; 
    console.log('Font ' + config.fontName + ' successfully created!') ; 
  })
  .on('error', function (err) {
    console.log(err) ; 
  }) ; 

var unicode = config.firstGlyph ; 
var glyphs = Array() ; 

/**
 * Créé le fichier Less
 */

var createLess = function (glyphs) {

  // Charge le template
  fs.readFile(config.pathLessSrc, function (err, data) {

    if (err) throw err ;

    data = data.toString().replace(/{{fontName}}/g, config.fontName) ; 

    // liste des caractères
    var listChar = '' ; 
    // les classes
    var classes = '' ; 

    // On prépare le contenu du Less
    glyphs.forEach(function (glyph) { 

      listChar += '  ' + glyph.name + ': "' 
               + glyph.string + '" ; \n' ;
      classes  += '.icon-' + glyph.name + ' { \n' 
               +  '  .icon(' + glyph.name + ') ; \n'
               +  '} \n' ; 
    }) ; 

    // On insert la liste des caractères et des classes
    data = data.toString().replace(/{{listChar}}/, listChar) ; 
    data = data.toString().replace(/{{classes}}/, classes) ; 

    // On sauve le fichier
    fs.writeFile(config.pathLess, data, function (err) {
      if (err) throw err ; 
      console.log('Fichier LESS créé') ; 
    }) ; 
  }) ; 
}


/**
 * Créé les différents formats de polices
 */

var convertFont = function () {

  // TTF
  var ttf = svg2ttf(fs.readFileSync(
                config.pathFont + '/' + config.fontName + '.svg')
              .toString(), {}) ;
  fs.writeFileSync(
      config.pathFont + '/' + config.fontName + '.ttf', 
      new Buffer(ttf.buffer)
  ) ;
  console.log('TTF font created!') ; 

  // EOT
  var eot = new Buffer(ttf2eot(ttf.buffer).buffer) ; 
  fs.writeFile(
      config.pathFont + '/' + config.fontName + '.eot',
      eot, function (err) {
        if (err) throw err ; 
        console.log('EOT font created')
      }) ; 

  // WOFF
  var woff = new Buffer(ttf2woff(ttf.buffer).buffer) ; 
  fs.writeFile(
      config.pathFont + '/' + config.fontName + '.woff',
      woff, function (err) {
        if (err) throw err ; 
        console.log('WOFF font created')
      }) ; 

  // WOFF2
  var woff2 = new Buffer(ttf2woff2(ttf.buffer).buffer) ; 
  fs.writeFile(
      config.pathFont + '/' + config.fontName + '.woff2',
      woff2, function (err) {
        if (err) throw err ; 
        console.log('WOFF2 font created')
      }) ; 
}


/**
 * On charge la liste des icônes
 */

fs.readdir(config.pathSvg, function (err, files) {
  
  if (err) throw err ;
  
  files.forEach(function (file) {

    if (file.search(/\.svg$/) > -1) {

      var glyphName = file.match(/^(.+)\.svg$/)[1] ; 
      var glyph = fs.createReadStream(config.pathSvg + '/' + file) ; 
      glyph.metadata = {
        unicode: [String.fromCharCode(unicode)],
        name: glyphName
      } ; 
      fontStream.write(glyph) ; 
      glyph.metadata.string = '\\' + unicode.toString(16).toUpperCase() ; 
      glyphs.push(glyph.metadata) ; 
      unicode++ ; 
    }
  }) ;

  fontStream.end() ; 
}) ; 




