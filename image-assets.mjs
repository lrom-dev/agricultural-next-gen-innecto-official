// Change these paths to swap the app's bundled artwork.
export const imageAssets = Object.freeze({
  brandLogo: 'assets/brand/logo-mark.svg',
  authHero: 'ani_custom_graphics/ani_asset_pack/ANI UI Design - Light Mode Log In or Sign Up Intro Photo.png',
  homeIllustration: 'assets/illustrations/hero-illustration.svg',
  composerAvatar: 'assets/avatars/farmer-1.svg',
  avatars: [
    'assets/avatars/farmer-1.svg',
    'assets/avatars/farmer-2.svg',
    'assets/avatars/farmer-3.svg',
  ],
  marketplaceProducts: 'ani_custom_graphics/ani_asset_pack/ANI UI Design - Marketplace Products.png',
});

export function avatarImage(index) {
  return imageAssets.avatars[Math.abs(Number(index) || 0) % imageAssets.avatars.length];
}

export function applyImageAssets(root = document) {
  root.querySelectorAll('[data-asset]').forEach((image) => {
    const path = imageAssets[image.dataset.asset];
    if (path) image.src = path;
  });

  document.documentElement.style.setProperty(
    '--marketplace-product-sprite',
    `url(${JSON.stringify(imageAssets.marketplaceProducts)})`,
  );
}
