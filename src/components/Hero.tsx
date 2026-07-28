export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/380628/pexels-photo-380628.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Автосервиз"
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 w-full">
        <div className="max-w-3xl fade-up">
          <span className="inline-block px-3 py-1 mb-5 text-xs font-semibold uppercase tracking-wider text-mtex-lightblue border border-mtex-lightblue/40 rounded-full">
            Авточасти втора употреба &middot; Автосервиз
          </span>
          <h1 className="text-4xl md:text-6xl font-bold uppercase text-white leading-[1.05] text-balance">
            Качествени авточасти втора употреба и професионален автосервиз
          </h1>
          <p className="mt-5 text-lg md:text-xl text-mtex-lightblue font-medium text-balance">
            Над 10 000 налични части с гаранция и бърза доставка до 24 часа
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a href="#parts" className="btn-red text-base">
              Разгледай частите
            </a>
            <a href="#service" className="btn-outline-blue text-base">
              Запиши час за сервиз
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-zinc-500 text-xs uppercase tracking-widest hidden md:block">
        Свали надолу
      </div>
    </section>
  );
}