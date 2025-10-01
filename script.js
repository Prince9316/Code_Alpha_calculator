(() => {
  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const keys = document.querySelector('.keys');

  let expression = '';

  // sanitize input to show friendly characters but evaluate using JS operators
  function displayExpression(text){
    expressionEl.textContent = text || '0';
  }

  function displayResult(value){
    resultEl.textContent = = ${value};
  }

  function safeEvaluate(expr){
    // Replace friendly operators and percent handling
    let safe = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');

    // handle percentage: convert '50%' to '(50/100)'
    safe = safe.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    safe = safe.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

    // remove leading zeros in weird places for neatness
    safe = safe.replace(/\s+/g, '');

    // prevent obviously dangerous characters
    if (/[^0-9.+\-*/()%]/.test(safe)) throw new Error('Invalid characters');

    // avoid ending with operator
    safe = safe.replace(/[+\-*/()]++$/g, '');

    // use Function instead of eval (still runs JS, but we control the input)
    // final sanity: limit length
    if (safe.length > 200) throw new Error('Expression too long');

    // evaluate
    // eslint-disable-next-line no-new-func
    const fn = new Function(return (${safe}););
    const val = fn();
    if (!isFinite(val)) throw new Error('Math error');
    return +Number(val.toFixed(12)); // trim floating noise
  }
   function updateDisplay(){
    displayExpression(expression);
    try{
      const val = safeEvaluate(expression || '0');
      displayResult(val);
    }catch(e){
      displayResult('—');
    }
  }

  function append(value){
    // manage multiple dots and operator sequences
    const last = expression.slice(-1);

    if (value === '.'){
      // find last number token
      const match = expression.match(/(\d*\.?\d*)$/);
      if (match && match[0].includes('.')) return; // already has dot
      expression += '.';
      updateDisplay();
      return;
    }
         if (/[*+/\-]/.test(value)){
      // replace last operator if last is operator
      if (/[*+/\-]$/.test(expression)){
        expression = expression.slice(0, -1) + value;
      } else if (expression === ''){
        // if empty and user presses -, allow negative start
        if (value === '-') expression = '-';
      } else {
        expression += value;
      }
      updateDisplay();
      return;
    }

    // digits or percent
    expression += value;
    updateDisplay();
  }

  function clearAll(){ expression = ''; updateDisplay(); }
  function backspace(){ expression = expression.slice(0, -1); updateDisplay(); }
  function doEquals(){
    try{
      const val = safeEvaluate(expression || '0');
      expression = String(val);
      updateDisplay();
    }catch(e){
      // show error briefly
      resultEl.textContent = '= Error';
      setTimeout(updateDisplay, 900);
    }
  }

  // click handling
  keys.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const value = btn.dataset.value;

    if (action === 'clear') return clearAll();
    if (action === 'backspace') return backspace();
    if (action === 'equals') return doEquals();
    if (value) return append(value);
  });
    // keyboard support
  window.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') { append(e.key); e.preventDefault(); return }
    if (e.key === '.') { append('.'); e.preventDefault(); return }
    if (e.key === 'Enter') { doEquals(); e.preventDefault(); return }
    if (e.key === 'Backspace') { backspace(); e.preventDefault(); return }
    if (e.key === 'Escape') { clearAll(); e.preventDefault(); return }
    // operators (allow both key and common symbols)
    if (['+','-','*','/','%'].includes(e.key)) { append(e.key); e.preventDefault(); return }
    // support × and ÷ from some keyboards
    if (e.key === '×') { append('*'); e.preventDefault(); return }
    if (e.key === '÷') { append('/'); e.preventDefault(); return }
  });
      // live input preview when the page loads
  updateDisplay();
})();