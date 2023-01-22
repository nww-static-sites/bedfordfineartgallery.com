use Mojo::Base -strict, -signatures;
use Cpanel::JSON::XS;
use JSON::Slurper -std_auto, -encoder => Cpanel::JSON::XS->new->utf8
        ->pretty
        ->canonical
        ->allow_nonref
        ->allow_blessed
        ->convert_blessed;
use Mojo::File qw(path);

exit main(@ARGV);

sub main() {
    path('cms/paintings')->list->each(sub ($file, $) {
        say "Slurping $file";
        my $painting = slurp_json $file;

        if (!$painting->{metaTitle} or $painting->{metaTitle} eq '19th Century Paintings - Bedford Fine Art Gallery - 19th Century Art for Sale') {
            my $artist_name;
            if ($painting->{artist}) {
                my $artist = slurp_json "cms/artists/$painting->{artist}";
                $artist_name = $artist->{name};
            }

            $painting->{metaTitle} = join ' - ', grep $_, $artist_name, $painting->{title}, '19th Century American Fine Art';

            say "Spurting $file";
            spurt_json $painting, $file;
        }
    });

    0;
}
