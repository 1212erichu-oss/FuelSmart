const FuelStorage = (() => {
  const KEY = 'fuelsmart-v1';
  const sample = [
    { name: 'Chicken sandwich', group: 'protein', energy: 'Protein can help support steady energy.' },
    { name: 'Brown rice', group: 'grain', energy: 'Whole grains can provide longer-lasting energy.' },
    { name: 'Apple', group: 'fruit', energy: 'Fruit provides carbohydrates and helpful nutrients.' },
    { name: 'Carrots', group: 'vegetable', energy: 'Vegetables add vitamins, minerals, and fiber.' },
    { name: 'Milk', group: 'dairy', energy: 'Milk provides protein and calcium.' }
  ];
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { plate: sample.slice(0, 2) }; } catch { return { plate: sample.slice(0, 2) }; }
  }
  function write(data) { localStorage.setItem(KEY, JSON.stringify(data)); }
  return { sample, read, write };
})();
