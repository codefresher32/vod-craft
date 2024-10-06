MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="==MYBOUNDARY=="

--==MYBOUNDARY==
Content-Type: text/cloud-config; charset="us-ascii"

runcmd:
- echo "Welcome to live stream pull push service"

%{if length(extra_user_data) > 0 ~}
--==MYBOUNDARY==
Mime-Version: 1.0
Content-Type: text/x-shellscript; charset="us-ascii"

${extra_user_data}
%{endif ~}
--==MYBOUNDARY==--
