window.onload = () => {
   const scrollHeader = () => {
      const header = document.getElementById('navbar')
      if (this.scrollY >= 400) header.classList.add('scroll-header');
      else header.classList.remove('scroll-header');
   }
   window.addEventListener('scroll', scrollHeader);
}