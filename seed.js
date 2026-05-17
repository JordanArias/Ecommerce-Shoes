const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lrhkbdkbbbrjvynieqta.supabase.co';
const supabaseKey = 'sb_publishable_xnH6P0xsJrsEPnnXqZ3OVw_ZibqFkhd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Fetching categories...');
  const { data: categories, error: catError } = await supabase.from('categorias').select('*');
  if (catError) {
    console.error('Error fetching categories:', catError);
    return;
  }
  
  if (!categories || categories.length === 0) {
    console.log('No categories found. Run the schema SQL first.');
    return;
  }

  const perfId = categories.find(c => c.nombre === 'Performance')?.id;
  const streetId = categories.find(c => c.nombre === 'Street')?.id;
  
  if (!perfId || !streetId) {
    console.log('Categories not found.');
    return;
  }

  const products = [
    {
      categoria_id: perfId,
      nombre: 'Vortex Neon 01',
      descripcion: 'Zapatilla de alto rendimiento con detalles en verde neón.',
      precio: 240.00,
      imagen_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcrnOYNXOOgitQjrJxZiAmzhoyeWOnyIOinNmEWX2mOS8-EO6DmTXlkXFdmi4lM6Z3ZEtA5E8gi5WjCdlQPh4ozaVKaJv9Z0aBjw349RYuXwlN16te3jNZ7WHXx23n9fbLoHwhrzlKyrrUox2aSUJh84otBTOPA6Gv0QOMmI0eT_iCyheIyGDw1o1hLp_CM47Tuw9n5OAlwqeEwGTmxi2QZnoS-Qo4TEGgReMHI-bVEPV9fFD10ynSuq9SSjEfuoDAWy-j4ywboys',
      estado: 'activo',
      destacado: true
    },
    {
      categoria_id: streetId,
      nombre: 'Legacy White 04',
      descripcion: 'Clásico blanco reimaginado para el futuro.',
      precio: 185.00,
      imagen_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNzboQdT6hSjJRL-eQDwg2DWCEK0nR1IjH5Kirb3W8UKoIzzPBd_n0AmeRY1Mh7TCfuRVrABlQFqu_F3JY1FzBzHKjjgYJn1nILh01jhCLFpKELex56VUBZs3t3hBmktEXcIw3s9YElw1vupaJYb5mLtUggnVZ-HcTRfUJ2Nps7AaVrBwO7-1Ig-fVOWrsasXb0lUYTTprFV8xNKE6WWP5mqrgqD_AnIFOZ79suwopP9KcnYPPa7IpQ6L3On_NDuqIoiuX6UCNZC0',
      estado: 'activo',
      destacado: true
    },
    {
      categoria_id: streetId,
      nombre: 'Obsidian X-Treme',
      descripcion: 'Tech-wear oscuro y sigiloso.',
      precio: 320.00,
      imagen_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIF-bR3LpEdh1s1hVQxVWKgdd1G2VWIoOj6u0aX2DW55PQ78v33oulcRkg25lL4TSOtDvHTglhiBtcqeLMDh0fwYeYeMnNtTGs4n5uqJe9CxQyQg5c5N7IDpVULhEDSyeTpmk_ci6IoX8VM-MbfOp4Bchov1nLZS_i1XO_t0y30Q0HyBUIq005k8EWvV7U-gPahzrUlLeVh2c6aWh2-ldsCnlq2fe3w2YkjDwK2VrASL9BuOgrYzAiPYIdw0xxTvYMr4iDLViMD-k',
      estado: 'activo',
      destacado: true
    },
    {
      categoria_id: perfId,
      nombre: 'Blaze Orange 22',
      descripcion: 'Zapatilla naranja vibrante para correr.',
      precio: 210.00,
      imagen_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeosua7a4yqG6bXIo2QMFvaEa1GXm7J3i3SP2n7LH8fFP-p9n48K8IoBjnOYxyNKc6cZZf8BlT1EyVpGnhYp2ce--4zY3C5JeiPpqEczIcrpsRanFFKOljDQfl8uH_KxwdtNoTv6Be9NzORXyya3ck-RL8Pjxuc1dqoDeMzXCBDLD6wCzdlNA_byGXBCRyyq2ms69Ag1OFhE6LxEhF8xDQbgUeYZ0fNdDFsu43qr62G5hQaP5xe3BT_CDe-NWmgsk_VQl9L3l00pw',
      estado: 'activo',
      destacado: true
    }
  ];

  console.log('Inserting products...');
  const { error: insertError } = await supabase.from('productos').insert(products);
  
  if (insertError) {
    console.error('Error inserting products:', insertError);
  } else {
    console.log('Products seeded successfully!');
  }
}

seed();
