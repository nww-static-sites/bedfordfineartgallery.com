use Mojo::Base -strict, -signatures;
use Mojo::File 'path';
use Mojo::JSON 'decode_json';
use Text::CSV_XS 'csv';

exit main();

sub main () {
    csv(
        in  => path('cms/testimonials')->list_tree()->map(sub { decode_json($_->slurp) })->to_array,
        out => 'testimonials.csv',
    );

    0;
}
