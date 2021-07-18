#include <stdlib.h>
#include <stdio.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <string.h>
#include <sys/stat.h>
#include <fcntl.h>

struct posiljanje
{
	int32_t meta; 
	int32_t ime_zbirke_len;
	int32_t velikost;
	int32_t hash;
	char *pot;
	char *vsebina;//shrani datoteko
};

int main(int argc, char const *argv[])
{
	struct stat sb;
	struct posiljanje podatki;
	int fd = 0;
	int file;
	int saved_bit = 0;
	int prebrano;
	char buffer[128] = {'\0'};
	struct sockaddr_in naslov;

	file = open(argv[3], O_RDONLY);
	printf("%s\n", argv[3]);
	if(file == -1)
	{	
		printf("%s", argv[2]);
		printf("SPODLETEL\n");
		return -1;
	}
	
	stat(argv[3], &sb);														//preparing metadata

	if(S_ISREG(sb.st_mode))
	{
		podatki.meta = 2147483648;
	}
	else
	{
		podatki.meta = 1073741824;
	}


	
 
	podatki.ime_zbirke_len = strlen(argv[3])+1;											
	podatki.pot = (char*) malloc(podatki.ime_zbirke_len+1);
	strcpy(podatki.pot, argv[3]);
	podatki.pot[strlen(argv[3])] = '\0';
	podatki.velikost = sb.st_size;
	podatki.vsebina = (char*) malloc(podatki.velikost);


	podatki.hash = 0;
 
	while(prebrano = read(file, buffer, 128))								//reading from file and making a hash
	{

		for(int i = 0; i < prebrano; i++)
		{
				podatki.hash += buffer[i];
		}

		memcpy(podatki.vsebina+saved_bit, buffer, prebrano);
		saved_bit += prebrano;
	}
	
	fd = socket(AF_INET, SOCK_STREAM,0);
	
	printf("%d", fd);

	if(fd < 0)
	{
		printf("f\n");
	}
	naslov.sin_family = AF_INET;
	naslov.sin_port = atoi(argv[2]);
	inet_pton(AF_INET, argv[1], &(naslov.sin_addr));
	char str[INET_ADDRSTRLEN];
	inet_ntop(AF_INET, &(naslov.sin_addr), str, INET_ADDRSTRLEN);
	if(connect(fd, (struct sockaddr*) &naslov, sizeof(naslov)) < 0)			//connecting to socket
	{
		printf("SPODLETEL\n");
		return -1;
	}
	write(fd, &podatki.meta, sizeof(int32_t));								//sending metadata
	write(fd, &podatki.ime_zbirke_len, sizeof(int32_t));
	write(fd, &podatki.velikost, sizeof(int32_t));
	write(fd, &podatki.hash, sizeof(int32_t));
	write(fd, podatki.pot, podatki.ime_zbirke_len);


	saved_bit = 0;
	do
	{
		prebrano = write(fd, podatki.vsebina+saved_bit, 128);				//sending file 
		saved_bit += prebrano;
	}while(saved_bit < podatki.velikost);
	free(podatki.pot);
	free(podatki.vsebina);
	
	printf("USPEL	");
	if(podatki.meta = 2147483648)
	{
		printf("ZBIRKA    ");
	}
	else
	{
		printf("IMENIK	  ");
	}

	
	printf("%s    ", podatki.pot);
	printf("%d\n", podatki.velikost);
}
