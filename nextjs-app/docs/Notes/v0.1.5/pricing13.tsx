const Pricing13 = () => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="rounded-xl border border-border py-6 md:py-8 lg:pt-16 lg:pb-12">
          <div className="px-6 md:px-8 lg:px-12">
            <div className="mb-8 md:mb-10 md:flex md:justify-between lg:mb-9">
              <div className="lg:w-2/3">
                <h1 className="mb-4 text-2xl font-medium md:text-3xl lg:text-4xl">
                  Additional add-ons
                </h1>
                <p className="text-xs text-muted-foreground md:text-sm lg:text-base">
                  Curabitur egestas risus risus, consectetur vestibulum ante
                  commodo quis. Duis aliquam elit sapien, porttitor vehicula
                  purus convallis in.
                </p>
              </div>
              <img
                src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg"
                alt="placeholder"
                className="hidden size-24 md:block lg:size-32"
              />
            </div>
            <div className="flex flex-col gap-x-8 gap-y-3 xl:flex-row">
              <div className="flex flex-1 flex-col rounded-lg bg-accent p-6 lg:py-8">
                <h2 className="mb-1.5 text-base font-medium lg:mb-2 lg:text-lg">
                  Addon Option 1
                </h2>
                <div className="grid flex-1 grid-cols-1 gap-x-10 md:grid-cols-3 lg:grid-cols-1">
                  <p className="mb-8 max-w-xs text-xs text-muted-foreground md:col-span-2 md:mb-0 lg:mb-10 lg:text-base">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  </p>
                  <div className="col-span-1 md:mt-auto md:ml-auto lg:ml-0">
                    <p>
                      <span className="font-medium lg:text-2xl">9</span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {" "}
                        / Month
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col rounded-lg bg-accent p-6 lg:py-8">
                <h2 className="mb-1.5 text-base font-medium lg:mb-2 lg:text-lg">
                  Addon Option 2
                </h2>
                <div className="grid flex-1 grid-cols-1 gap-x-10 md:grid-cols-3 lg:grid-cols-1">
                  <p className="mb-8 max-w-xs text-xs text-muted-foreground md:col-span-2 md:mb-0 lg:mb-10 lg:text-base">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  </p>
                  <div className="col-span-1 md:mt-auto md:ml-auto lg:ml-0">
                    <p>
                      <span className="font-medium lg:text-2xl">99</span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {" "}
                        / Month
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col rounded-lg bg-accent p-6 lg:py-8">
                <h2 className="mb-1.5 text-base font-medium lg:mb-2 lg:text-lg">
                  Addon Option 3
                </h2>
                <div className="grid flex-1 grid-cols-1 gap-x-10 md:grid-cols-3 lg:grid-cols-1">
                  <p className="mb-8 max-w-xs text-xs text-muted-foreground md:col-span-2 md:mb-0 lg:mb-10 lg:text-base">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  </p>
                  <div className="col-span-1 md:mt-auto md:ml-auto lg:ml-0">
                    <p>
                      <span className="font-medium lg:text-2xl">
                        Contact Sales
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Pricing13 };
