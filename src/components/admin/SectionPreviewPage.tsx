switch (section.section_type) {
       case 'hero':
         return <HeroSplitLayout 
         content={{
           headline: {
             text: "Medium length hero headline goes here",
             color: "#000000"
           },
           description: {
             text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
             color: "#6B7280"
           },
           primaryButton: {
             text: "Primary Button",
             href: "#",
             variant: "primary"
           },
           secondaryButton: {
             text: "Secondary Button",
             href: "#",
             variant: "outline"
           },
           heroImage: {
             src: "",
             alt: "Hero image"
           },
           backgroundColor: "#FFFFFF"
         }}
       />;
      default:
        return (
          <div className="p-12 bg-gray-100 text-center">
            <p>Unknown section type</p>
          </div>
        );
    }