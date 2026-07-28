export function About() {
  return (
    <section id="about" className="py-16 md:py-24 bg-black">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="section-title text-white">За нас</h2>
            <p className="text-mtex-lightblue font-medium mb-4">MTEX Parts</p>
            <div className="space-y-4 text-zinc-300 leading-relaxed">
              <p>
                MTEX Parts е специализиран automotive център за продажба на качествени авточасти втора употреба и професионално обслужване на автомобили.
                С над 10 000 налични части на склад и собствен автосервиз, предлагаме комплексни решения за вашия автомобил.
              </p>
              <p>
                Работим с доказани доставчици и тестваме всяка част преди продажба. Гарантираме 14-дневен тест период и бърза доставка до цялата страна чрез Еконт.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div>
                <p className="font-heading text-3xl font-bold text-mtex-red">10k+</p>
                <p className="text-xs text-zinc-400 uppercase">Части на склад</p>
              </div>
              <div>
                <p className="font-heading text-3xl font-bold text-mtex-lightblue">14</p>
                <p className="text-xs text-zinc-400 uppercase">Дни тест период</p>
              </div>
              <div>
                <p className="font-heading text-3xl font-bold text-white">24/7</p>
                <p className="text-xs text-zinc-400 uppercase">Пътна помощ</p>
              </div>
            </div>
          </div>
          <div className="aspect-[4/3] rounded-xl overflow-hidden border border-zinc-800">
            <img
              src="https://images.pexels.com/photos/4480505/pexels-photo-4480505.jpeg?auto=compress&cs=tinysrgb&w=1000"
              alt="Автосервиз MTEX"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}