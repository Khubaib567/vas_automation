#!/usr/bin/perl
use strict;
use warnings;
use CGI;

my $cgi = CGI->new;
my $xml_input = do { local $/; <STDIN> };

# Simulate parsing XML
if ($xml_input =~ /<subscription>true<\/subscription>/i) {
    print $cgi->header('application/xml');
    print "<?xml version=\"1.0\"?><response><message>Subscribed</message></response>";
} else {
    print $cgi->header('application/xml');
    print "<?xml version=\"1.0\"?><response><message>Unsubscribed</message></response>";
}
