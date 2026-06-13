#!/usr/bin/perl
use strict;
use warnings;
use CGI;
use LWP::UserAgent;
use URI::Escape;
use XML::LibXML;

my $cgi = CGI->new;

# Only accept POST requests
# if ($cgi->request_method ne 'POST') {
#     print $cgi->header('application/xml', '400 Bad Request');
#     print "<?xml version=\"1.0\"?><error>Only POST requests are allowed</error>";
#     exit;
# }

# Read full XML body
my $xml_input = do { local $/; <STDIN> };

# Parse XML
my $parser = XML::LibXML->new;
my $subscription;
eval {
    my $doc = $parser->parse_string($xml_input);
    $subscription = $doc->findvalue('//subscription');
};
if ($@) {
    print $cgi->header('application/xml', '400 Bad Request');
    print "<?xml version=\"1.0\"?><error>Invalid XML format</error>";
    exit;
}

# -------------------------------
# 🧹 Sanitize the <subscription> tag value
# -------------------------------
$subscription =~ s/^\s+|\s+$//g;        # Trim spaces
$subscription = lc $subscription;        # Convert to lowercase
$subscription =~ s/[^a-z0-9]//g;         # Remove non-alphanumeric characters
$subscription = ($subscription eq 'true') ? 'true' : 'false';  # Normalize invalid values

# -------------------------------
# 🔗 Build internal API URL based on subscription
# -------------------------------
my $api_base = "https://vas-management-system.vercel.app/api/user/bulk";
# my $api_url  = ($subscription eq 'true')
#     ? "$api_base/subscribe"
#     : "$api_base/unsubscribe";

# Pass sanitized subscription value as query parameter
my $url_with_query = $api_base . "?subscription=" . uri_escape($subscription);

# -------------------------------
# 🌐 Send request to internal API
# -------------------------------
my $ua = LWP::UserAgent->new(timeout => 10);
my $response = $ua->get(
    $url_with_query,
    'Content-Type' => '*/*'  # Wildcard content-type
);

# -------------------------------
# 📦 Return XML response to client
# -------------------------------
print $cgi->header('application/xml; charset=utf-8');
print "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";

if ($response->is_success) {
    print "<response>\n";
    print "  <subscription>$subscription</subscription>\n";
    print "  <status>success</status>\n";
    print "  <message>Internal API called successfully</message>\n";
    print "</response>\n";
} else {
    print "<response>\n";
    print "  <subscription>$subscription</subscription>\n";
    print "  <status>error</status>\n";
    print "  <message>API request failed: " . $response->status_line . "</message>\n";
    print "</response>\n";
}
