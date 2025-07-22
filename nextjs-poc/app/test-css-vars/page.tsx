export default function TestCSSVarsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">CSS Variables Test</h1>
      
      <div className="space-y-4">
        {/* Test CSS variable directly */}
        <div 
          className="p-4 border-2"
          style={{ 
            backgroundColor: 'var(--primary-button-background-color)',
            color: 'var(--primary-button-text-color)',
            borderColor: 'var(--primary-button-border-color)'
          }}
        >
          Direct style test: This should have pink background
        </div>
        
        {/* Test Tailwind arbitrary values */}
        <div className="p-4 bg-[var(--primary-button-background-color)] text-[var(--primary-button-text-color)] border-2 border-[var(--primary-button-border-color)]">
          Tailwind arbitrary values test: This should also be pink
        </div>
        
        {/* Test hardcoded pink */}
        <div className="p-4 bg-[#EE0D79] text-white border-2 border-[#EE0D79]">
          Hardcoded pink test: This should definitely be pink
        </div>
        
        {/* Show CSS variable values */}
        <div className="mt-8 p-4 bg-gray-100">
          <h2 className="font-bold mb-2">CSS Variable Values (check in DevTools):</h2>
          <ul className="space-y-1 text-sm">
            <li>--primary-button-background-color: should be #EE0D79</li>
            <li>--primary-button-text-color: should be #FFFFFF</li>
            <li>--primary-button-border-color: should be #EE0D79</li>
          </ul>
        </div>
      </div>
    </div>
  );
}