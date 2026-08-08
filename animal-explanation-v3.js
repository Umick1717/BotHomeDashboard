(() => {
'use strict';
const answers=document.getElementById('answers');
const message=document.getElementById('message');
if(!answers||!message)return;

const explanations={
  lion:'A lion is a large wild cat that lives in groups called prides.',
  tiger:'A tiger is a large wild cat with orange fur and black stripes.',
  elephant:'An elephant is a very large land animal with a long trunk.',
  giraffe:'A giraffe is a tall African animal with a very long neck.',
  zebra:'A zebra is an African animal with black and white stripes.',
  rhino:'A rhino is a large animal with thick skin and one or two horns.',
  hippopotamus:'A hippopotamus is a large African animal that spends a lot of time in water.',
  bear:'A bear is a large mammal with strong legs and thick fur.',
  wolf:'A wolf is a wild canine that often lives and hunts in a pack.',
  fox:'A fox is a small wild canine with a pointed face and a bushy tail.',
  deer:'A deer is a hoofed animal, and many males grow antlers.',
  kangaroo:'A kangaroo is an Australian animal that moves by hopping and carries babies in a pouch.',
  panda:'A panda is a black and white bear that mainly eats bamboo.',
  koala:'A koala is an Australian marsupial that eats eucalyptus leaves.',
  sloth:'A sloth is a slow-moving tree animal from Central and South America.',
  monkey:'A monkey is a primate that is often agile and good at climbing.',
  chimpanzee:'A chimpanzee is an intelligent great ape from Africa.',
  orangutan:'An orangutan is a red-haired great ape that lives in Asian rainforests.',
  gorilla:'A gorilla is a large and powerful great ape from Africa.',
  cheetah:'A cheetah is the fastest land animal and is built for short, fast runs.',
  leopard:'A leopard is a spotted wild cat that is an excellent climber.',
  'snow leopard':'A snow leopard is a mountain cat with thick fur that lives in cold parts of Asia.',
  jaguar:'A jaguar is a powerful spotted wild cat from the Americas.',
  cougar:'A cougar is a large wild cat also known as a mountain lion.',
  dog:'A dog is a domesticated animal that has lived with people for thousands of years.',
  cat:'A cat is a small domesticated feline known for agility and curiosity.',
  rabbit:'A rabbit is a small mammal with long ears and strong back legs.',
  horse:'A horse is a large hoofed mammal that people have used for riding and work.',
  cow:'A cow is a farm animal raised for milk and other products.',
  buffalo:'A buffalo is a large hoofed mammal with strong horns.',
  goat:'A goat is a sure-footed farm animal that can climb steep ground.',
  sheep:'A sheep is a farm animal with a woolly coat.',
  pig:'A pig is an intelligent farm mammal with a strong sense of smell.',
  chicken:'A chicken is a common farm bird raised for eggs and meat.',
  duck:'A duck is a water bird with webbed feet and a broad bill.',
  goose:'A goose is a large water bird that often migrates in groups.',
  turkey:'A turkey is a large bird native to North America.',
  dove:'A dove is a bird related to pigeons and is often associated with peace.',
  parrot:'A parrot is a colorful bird with a curved beak, and some parrots can imitate sounds.',
  eagle:'An eagle is a large bird of prey with excellent eyesight.',
  owl:'An owl is a bird of prey that is well adapted for seeing and hunting at night.',
  hawk:'A hawk is a bird of prey with sharp eyesight and strong talons.',
  bat:'A bat is a flying mammal, and many bats use echolocation to navigate.',
  penguin:'A penguin is a flightless seabird that is an excellent swimmer.',
  flamingo:'A flamingo is a tall pink water bird with long legs.',
  swan:'A swan is a large water bird with a long neck.',
  seagull:'A seagull is a coastal bird often seen near beaches and harbors.',
  crow:'A crow is a highly intelligent black bird.',
  peacock:'A peacock is a male peafowl famous for its colorful tail feathers.',
  hummingbird:'A hummingbird is a tiny bird that can hover by beating its wings very quickly.',
  shark:'A shark is a fish with a skeleton made mostly of cartilage.',
  dolphin:'A dolphin is an intelligent marine mammal that breathes air.',
  whale:'A whale is a very large marine mammal that breathes air through a blowhole.',
  seal:'A seal is a marine mammal that swims well and rests on land or ice.',
  octopus:'An octopus is a sea animal with eight arms and remarkable problem-solving abilities.',
  jellyfish:'A jellyfish is a soft-bodied sea animal with tentacles.',
  seahorse:'A seahorse is a small marine fish with a horse-shaped head.',
  starfish:'A starfish, or sea star, is a marine animal usually shaped like a star.',
  clownfish:'A clownfish is a small colorful reef fish that often lives with sea anemones.',
  'sea turtle':'A sea turtle is a marine reptile that returns to land to lay eggs.',
  crocodile:'A crocodile is a large aquatic reptile with powerful jaws.',
  alligator:'An alligator is a large reptile related to crocodiles and usually has a broader snout.',
  turtle:'A turtle is a reptile protected by a hard shell.',
  iguana:'An iguana is a large lizard, and many species mainly eat plants.',
  chameleon:'A chameleon is a lizard known for independently moving eyes and changing color.',
  snake:'A snake is a long, legless reptile.',
  frog:'A frog is an amphibian that usually has strong back legs for jumping.',
  lizard:'A lizard is a reptile that usually has four legs and a long tail.',
  bee:'A bee is a flying insect that helps pollinate flowers.',
  butterfly:'A butterfly is an insect with colorful wings that develops from a caterpillar.',
  ant:'An ant is a social insect that lives in organized colonies.',
  beetle:'A beetle is an insect with hardened front wings that protect its flying wings.',
  ladybug:'A ladybug is a small beetle that often eats plant pests such as aphids.',
  dragonfly:'A dragonfly is a fast-flying insect commonly found near water.',
  grasshopper:'A grasshopper is an insect with powerful back legs for jumping.',
  spider:'A spider is an arachnid with eight legs and is not an insect.',
  scorpion:'A scorpion is an arachnid with pincers and a stinging tail.',
  'elephant seal':'An elephant seal is a very large seal, and adult males have a trunk-like nose.',
  otter:'An otter is a playful semi-aquatic mammal with dense waterproof fur.',
  hyena:'A hyena is a mammal known for strong jaws and complex social groups.'
};

let lastSpoken='';
function speakAnswer(name){
  const key=String(name||'').toLowerCase().trim();
  if(!key||key===lastSpoken)return;
  lastSpoken=key;
  const explanation=explanations[key]||`A ${key} is an animal. Listen carefully and repeat the word ${key}.`;
  if(!('speechSynthesis'in window))return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(`The correct answer is ${key}. ${explanation} Repeat after me: ${key}.`);
  u.lang='en-US';u.rate=.50;u.pitch=1;
  setTimeout(()=>speechSynthesis.speak(u),120);
}

function findCorrect(){
  const button=answers.querySelector('.answer.correct');
  if(!button)return;
  speakAnswer(button.dataset.answer||button.textContent);
}

new MutationObserver(findCorrect).observe(answers,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
})();
