var COLORS = [
  "black",
  "silver",
  "gray",
  "white",
  "maroon",
  "red",
  "purple",
  "green",
  "lime",
  "olive",
  "yellow",
  "navy",
  "blue",
  "teal",
  "aqua",
  "aquamarine",
  "beige",
  "brown",
  "burlywood",
  "coral",
  "chocolate",
  "crimson",
  "cyan",
  "magenta",
  "orange",
  "gold",
  "pink",
  "khaki",
  "plum",
  "wheat",
  "salmon",
  "peach",
  "mint",
  "ivory"
];


let ANIMALS = [
  'lion',
  'cow',
  'shark',
  'rabbit',
  'duck',
  'monkey',
  'goat',
  'koala',
  'tiger',
  'penguin',
  'panda',
  'bear',
  'horse',
  'giraffe',
  'lizard',
  'zebra',
  'elephant',
  'kangaroo',
  'cheetah',
  'wolf',
  'fox',
  'crocodile',
  'dolphin',
  'squirrel',
  'raccoon',
  'owl',
  'eagle',
  'leopard',
  'octopus',
  'snake',
  'turtle',
  'buffalo',
  'hedgehog',
  'chimpanzee',
  'bat',
  'flamingo',
  'hippo',
  'reindeer',
  'armadillo',
  'hyena'
];


let COUNTRIES = [
  'france',
  'china',
  'spain',
  'italy',
  'canada',
  'peru',
  'brazil',
  'argentina',
  'colombia',
  'mexico',
  'japan',
  'thailand',
  'england',
  'israel',
  'egypt',
  'russia',
  'germany',
  'india',
  'australia',
  'sweden',
  'norway',
  'denmark',
  'indonesia',
  'philippines',
  'turkey',
  'vietnam',
  'switzerland',
  'poland',
  'greece',
  'portugal',
  'austria',
  'belgium',
  'finland',
  'hungary',
  'pakistan',
  'bangladesh',
  'iran',
  'iraq',
  'ukraine',
  'netherlands',
  'malaysia',
  'chile',
  'singapore',
  'venezuela',
  'ireland'
];

  function randomWord(type=COLORS) {
    switch (type) {
      case 'animals':
        return ANIMALS[Math.floor(Math.random() * ANIMALS.length)];

      case 'countries':
        return COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      
      case 'colors':
      default:
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    }
  }
  
  export { randomWord };