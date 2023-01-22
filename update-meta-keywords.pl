use Mojo::Base -strict, -signatures;
use Cpanel::JSON::XS;
use JSON::Slurper -std_auto, -encoder => Cpanel::JSON::XS->new->utf8
        ->pretty
        ->canonical
        ->allow_nonref
        ->allow_blessed
        ->convert_blessed;
use Text::CSV_XS 'csv';

exit main(@ARGV);

sub main() {
    my $aoh = csv(in => 'bedford-keywords.csv', headers => 'auto', sep_char => "\t");

    for my $file (@$aoh) {
        my $filename = "cms/paintings/$file->{filename}.json" =~ s/\.html\.json/-html.json/r;;
        unless (-e $filename) {
            warn "no exist: $filename";
            next;
        }

        my $painting = slurp_json $filename;
        if (!$painting->{metaKeywords}) {
            $painting->{metaKeywords} = $file->{keywords};

            #say "Spurting $file";
            spurt_json $painting, $filename;
        }
    }

    0;
}
