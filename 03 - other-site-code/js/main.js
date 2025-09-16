// Animate Smooth Scroll

$('#view-teams').on('click', function() {
    
    const images = $('#teams').position().top;
    
    $('html, body').animate({
        
        scrollTop: teams
        
    }, 900);
    
});